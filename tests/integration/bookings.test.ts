import app, { init } from "@/app";
import { disconnectDB, prisma } from "@/config";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createUser, createSession } from "../factories";
import {
    createBooking,
    createEnrollment,
    createHotel,
    createRoom,
    createTicket,
    createTicketType,
} from "../factories/bookings-factory";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

afterAll(async () => {
    await disconnectDB();
});

const server = supertest(app);

describe("GET /booking", () => {
    describe("when token is invalid", () => {
        it("should respond with status 401 if no token is given", async () => {
            const response = await server.get("/booking");

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 401 if given token is not valid", async () => {
            const token = faker.lorem.word();

            const response = await server
                .get("/booking")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 401 if there is no session for given token", async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign(
                { userId: userWithoutSession.id },
                process.env.JWT_SECRET,
            );

            const response = await server
                .get("/booking")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    });
    describe("when token is valid", () => {
        it("should return status code 200 and booking information", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create booking context
            const hotel = await createHotel();
            const room = await createRoom(hotel.id, 2);
            const booking = await createBooking(user.id, room.id);
            // test
            const response = await server
                .get("/booking")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                id: booking.id,
                Room: {
                    id: room.id,
                    name: room.name,
                    capacity: room.capacity,
                    hotelId: room.hotelId,
                    createdAt: room.createdAt.toISOString(),
                    updatedAt: room.updatedAt.toISOString(),
                },
            });
        });
        it("should return status code 404", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // test
            const response = await server
                .get("/booking")
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(404);
        });
    });
});
describe("POST /booking", () => {
    describe("when token is invalid", () => {
        it("should respond with status 401 if no token is given", async () => {
            const response = await server.get("/booking");

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 401 if given token is not valid", async () => {
            const token = faker.lorem.word();

            const response = await server
                .get("/booking")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 401 if there is no session for given token", async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign(
                { userId: userWithoutSession.id },
                process.env.JWT_SECRET,
            );

            const response = await server
                .get("/booking")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    });
    describe("when token is valid", () => {
        it("should return status code 200 and return bookingId ", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room = await createRoom(hotel.id, 2);
            const enrollment = await createEnrollment(user.id);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, "PAID");

            // test
            const body = { roomId: room.id };
            const response = await server
                .post("/booking")
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                bookingId: expect.any(Number),
            });
        });
        it("should return status code 404 when roomId is non-existant", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            const body1 = { roomId: 0 };
            const response1 = await server
                .post("/booking")
                .send(body1)
                .set("Authorization", `Bearer ${token}`);
            expect(response1.statusCode).toBe(404);

            const body2 = { roomId: -1 };
            const response2 = await server
                .post("/booking")
                .send(body2)
                .set("Authorization", `Bearer ${token}`);
            expect(response2.statusCode).toBe(404);
        });
        it("should return status code 403 when roomId sent is at capacity", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room = await createRoom(hotel.id, 0);
            const enrollment = await createEnrollment(user.id);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, "PAID");

            // test
            const body = { roomId: room.id };
            const response = await server
                .post("/booking")
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(403);
        });
        it("should return status code 403 when user ticket is not presential", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room = await createRoom(hotel.id, 2);
            const enrollment = await createEnrollment(user.id);
            const ticketType = await createTicketType(true, true);
            await createTicket(enrollment.id, ticketType.id, "PAID");

            // test
            const body = { roomId: room.id };
            const response = await server
                .post("/booking")
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(403);
        });
        it("should return status code 403 when user ticket does not include hotel", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room = await createRoom(hotel.id, 2);
            const enrollment = await createEnrollment(user.id);
            const ticketType = await createTicketType(false, false);
            await createTicket(enrollment.id, ticketType.id, "PAID");

            // test
            const body = { roomId: room.id };
            const response = await server
                .post("/booking")
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(403);
        });
        it("should return status code 403 when user ticket's status is not as PAID", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room = await createRoom(hotel.id, 2);
            const enrollment = await createEnrollment(user.id);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, "RESERVED");

            // test
            const body = { roomId: room.id };
            const response = await server
                .post("/booking")
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(403);
        });
        it("should create new booking entry", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room = await createRoom(hotel.id, 2);
            const enrollment = await createEnrollment(user.id);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, "PAID");

            // test
            const body = { roomId: room.id };
            const preResponse = await server
                .post("/booking")
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            const { bookingId } = preResponse.body;
            const response = await prisma.booking.findFirst({
                where: { id: bookingId },
            });
            expect(response.id).toBe(bookingId);
        });
    });
});
describe("PUT /booking", () => {
    describe("when token is invalid", () => {
        it("should respond with status 401 if no token is given", async () => {
            const response = await server.get("/booking");

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 401 if given token is not valid", async () => {
            const token = faker.lorem.word();

            const response = await server
                .get("/booking")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 401 if there is no session for given token", async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign(
                { userId: userWithoutSession.id },
                process.env.JWT_SECRET,
            );

            const response = await server
                .get("/booking")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    });
    describe("when token is valid", () => {
        it("should return status code 200 and return bookingId ", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room1 = await createRoom(hotel.id, 2);
            const room2 = await createRoom(hotel.id, 2);
            const oldBooking = await createBooking(user.id, room1.id);

            // test
            const body = { roomId: room2.id };
            const response = await server
                .put(`/booking/${oldBooking.id}`)
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                bookingId: expect.any(Number),
            });
        });
        it("should return status code 404 when roomId sent on body is non-existant", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room1 = await createRoom(hotel.id, 2);
            const room2 = await createRoom(hotel.id, 2);
            const oldBooking = await createBooking(user.id, room1.id);

            // test
            const body = { roomId: 0 };
            const response = await server
                .put(`/booking/${oldBooking.id}`)
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(404);
        });
        it("should return status code 404 when bookingId sent on query parameters is non-existant", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room1 = await createRoom(hotel.id, 2);
            const room2 = await createRoom(hotel.id, 2);
            const oldBooking = await createBooking(user.id, room1.id);

            // test
            const body = { roomId: room2.id };
            const response = await server
                .put(`/booking/${0}`)
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(404);
        });

        it("should return status code 403 when roomId sent is at capacity", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room1 = await createRoom(hotel.id, 2);
            const room2 = await createRoom(hotel.id, 0);
            const oldBooking = await createBooking(user.id, room1.id);

            // test
            const body = { roomId: room2.id };
            const response = await server
                .put(`/booking/${oldBooking.id}`)
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(403);
        });
        it("should return status code 403 when user does not have a booking on their id", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);
            const bookingUser = await createUser();

            // create context
            const hotel = await createHotel();
            const room1 = await createRoom(hotel.id, 2);
            const room2 = await createRoom(hotel.id, 2);
            const oldBooking = await createBooking(bookingUser.id, room1.id);

            // test
            const body = { roomId: room2.id };
            const response = await server
                .put(`/booking/${oldBooking.id}`)
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(403);
        });

        it("should alter the booking entry sent on query parameters", async () => {
            // create user and valid session
            const user = await createUser();
            const token = await generateValidToken(user);
            await createSession(token);

            // create context
            const hotel = await createHotel();
            const room1 = await createRoom(hotel.id, 2);
            const room2 = await createRoom(hotel.id, 2);
            const oldBooking = await createBooking(user.id, room1.id);

            // test
            const body = { roomId: room2.id };
            const response = await server
                .put(`/booking/${oldBooking.id}`)
                .send(body)
                .set("Authorization", `Bearer ${token}`);
            const check = await prisma.booking.findFirst({
                where: { id: response.body.bookingId },
            });
            expect(check.roomId).toBe(room2.id);
        });
    });
});

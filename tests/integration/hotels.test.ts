import app, { init } from "@/app";
import { prisma } from "@/config";
import { JWTPayload } from "@/middlewares";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
    createUser,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/hotels");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server
            .get("/hotels")
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
            .get("/hotels")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with status 404 if there is no enrollment for the user ", async () => {
            const token = await generateValidToken();

            const response = await server
                .get("/hotels")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });
        it("should respond with status code 404 if there is not a ticket for the enrollmentId of the user", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const response = await server
                .get("/hotels")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });

        it("should respond with status code 404 if there is a ticket for the enrollmentId of the user but it does not have the status PAID", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: false,
                    includesHotel: true,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "RESERVED",
                },
            });

            const response = await server
                .get("/hotels")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });

        it("should respond with status code 404 if there is not a booking belonging to the userId", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: false,
                    includesHotel: true,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "PAID",
                },
            });

            const response = await server
                .get("/hotels")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });
        it("should respond with code 404 if ticket is remote", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: true,
                    includesHotel: true,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "PAID",
                },
            });

            const response = await server
                .get("/hotels")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });
        it("should respond with code 404 if ticket does not include hotel", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: false,
                    includesHotel: false,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "PAID",
                },
            });

            const response = await server
                .get("/hotels")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });
        it("should respond with status code 200 and list of hotels if previous conditions are met", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: false,
                    includesHotel: true,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "PAID",
                },
            });

            const hotel = await prisma.hotel.create({
                data: {
                    name: "Lorem",
                    image: "http://www.lorem.com.br",
                    updatedAt: now,
                },
            });

            const room = await prisma.room.create({
                data: {
                    name: "Lorem2",
                    capacity: 2,
                    hotelId: hotel.id,
                    updatedAt: now,
                },
            });

            const booking = await prisma.booking.create({
                data: {
                    userId: userId,
                    roomId: room.id,
                    updatedAt: now,
                },
            });

            const response = await server
                .get("/hotels")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        image: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    }),
                ]),
            );
        });
    });
});

describe("GET /hotels/:hotelId", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/hotels/1");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server
            .get("/hotels/1")
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
            .get("/hotels/1")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with status 404 if there is no enrollment for the user ", async () => {
            const token = await generateValidToken();

            const response = await server
                .get("/hotels/1")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });
        it("should respond with status code 404 if there is not a ticket for the enrollmentId of the user", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const response = await server
                .get("/hotels/1")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });

        it("should respond with status code 404 if there is a ticket for the enrollmentId of the user but it does not have the status PAID", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: false,
                    includesHotel: true,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "RESERVED",
                },
            });

            const response = await server
                .get("/hotels/1")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });

        it("should respond with status code 404 if there is not a booking belonging to the userId", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: false,
                    includesHotel: true,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "PAID",
                },
            });

            const response = await server
                .get("/hotels/1")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });
        it("should respond with code 404 if ticket is remote", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: true,
                    includesHotel: true,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "PAID",
                },
            });

            const response = await server
                .get("/hotels/1")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });
        it("should respond with code 404 if ticket does not include hotel", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: false,
                    includesHotel: false,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "PAID",
                },
            });

            const response = await server
                .get("/hotels/1")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });

        it("should respond with status 400 if hotelId does not exist or is not a number", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: false,
                    includesHotel: true,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "PAID",
                },
            });

            const hotel = await prisma.hotel.create({
                data: {
                    name: "Lorem",
                    image: "http://www.lorem.com.br",
                    updatedAt: now,
                },
            });

            const room = await prisma.room.create({
                data: {
                    name: "Lorem2",
                    capacity: 2,
                    hotelId: hotel.id,
                    updatedAt: now,
                },
            });

            const booking = await prisma.booking.create({
                data: {
                    userId: userId,
                    roomId: room.id,
                    updatedAt: now,
                },
            });

            const response = await server
                .get("/hotels/A")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(400);
        });

        it("should respond with status code 200 and the hotel with its list of Rooms if previous conditions are met", async () => {
            const token = await generateValidToken();
            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const bday = new Date("1989-02-06");
            const now = new Date();

            const enrollment = await prisma.enrollment.create({
                data: {
                    name: "Higor",
                    cpf: "11897653735",
                    birthday: bday,
                    phone: "(21)99724-0416",
                    userId: userId,
                    updatedAt: now,
                },
            });

            const enrollment_id = enrollment.id;

            const ticketType = await prisma.ticketType.create({
                data: {
                    name: "Lorem",
                    price: 250,
                    isRemote: false,
                    includesHotel: true,
                },
            });

            await prisma.ticket.create({
                data: {
                    ticketTypeId: ticketType.id,
                    enrollmentId: enrollment_id,
                    status: "PAID",
                },
            });

            const hotel = await prisma.hotel.create({
                data: {
                    name: "Lorem",
                    image: "http://www.lorem.com.br",
                    updatedAt: now,
                },
            });

            const room = await prisma.room.create({
                data: {
                    name: "Lorem2",
                    capacity: 2,
                    hotelId: hotel.id,
                    updatedAt: now,
                },
            });

            await prisma.booking.create({
                data: {
                    userId: userId,
                    roomId: room.id,
                    updatedAt: now,
                },
            });

            const response = await server
                .get(`/hotels/${hotel.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    image: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    Rooms: expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(Number),
                            name: expect.any(String),
                            capacity: expect.any(Number),
                            hotelId: expect.any(Number),
                            createdAt: expect.any(String),
                            updatedAt: expect.any(String),
                        }),
                    ]),
                }),
            );
        });
    });
});

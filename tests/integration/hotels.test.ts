import app, { init } from "@/app";
import { prisma } from "@/config";
import { JWTPayload } from "@/middlewares";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
    createEnrollmentWithAddress,
    createUser,
    createTicketType,
    createTicket,
    createPayment,
    generateCreditCardData,
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
        // Teste 1 - Verificar formato da resposta
        it("should respond status code 200 and with the array of hotel objects", async () => {
            const token = await generateValidToken();

            await prisma.hotel.create({
                data: {
                    name: "Cosmopolitan Hotel",
                    image: "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_627,q_auto,w_1200/itemimages/18/10/1810141_v8.jpeg",
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
        // Teste 2 - Verificar se o USUÁRIO existe (token), com uma INSCRIÇÃO VÁLIDA e com TICKET PAGO e que INCLUI HOSPEDAGEM =>
        // Pegar o userId do token, checar se há um ENROLLMENT.ID com aquele USERID, com um ticket com STATUS "PAID", além
        // disso, deve haver um booking com o userId.
        it("should respond with status code 404 if there is not an enrollment for user", async () => {
            const token = await generateValidToken();

            const { userId } = jwt.verify(
                token,
                process.env.JWT_SECRET,
            ) as JWTPayload;

            const enrollmentInfo = await prisma.enrollment.findFirst({
                where: {
                    userId: userId,
                },
            });
            expect(1).toBe(2);
        });
        // it(
        //     "should respond with status code 404 if there is not a paid ticket for the enrollment_id of the user",
        // );
        // it(
        //     "should respond with status code 404 if there is not a booking belonging to the user",
        // );
    });

    // it("should respond with status 400 if query param ticketId is missing", async () => {
    //     const token = await generateValidToken();

    //     const response = await server
    //         .get("/payments")
    //         .set("Authorization", `Bearer ${token}`);

    //     expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    // });

    // it("should respond with status 404 when given ticket doesnt exist", async () => {
    //     const user = await createUser();
    //     const token = await generateValidToken(user);
    //     await createEnrollmentWithAddress(user);

    //     const response = await server
    //         .get("/payments?ticketId=1")
    //         .set("Authorization", `Bearer ${token}`);

    //     expect(response.status).toEqual(httpStatus.NOT_FOUND);
    // });

    // it("should respond with status 401 when user doesnt own given ticket", async () => {
    //     const user = await createUser();
    //     const token = await generateValidToken(user);
    //     await createEnrollmentWithAddress(user);
    //     const ticketType = await createTicketType();

    //     const otherUser = await createUser();
    //     const otherUserEnrollment = await createEnrollmentWithAddress(
    //         otherUser,
    //     );
    //     const ticket = await createTicket(
    //         otherUserEnrollment.id,
    //         ticketType.id,
    //         TicketStatus.RESERVED,
    //     );

    //     const response = await server
    //         .get(`/payments?ticketId=${ticket.id}`)
    //         .set("Authorization", `Bearer ${token}`);

    //     expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    // });

    // it("should respond with status 200 and with payment data", async () => {
    //     const user = await createUser();
    //     const token = await generateValidToken(user);
    //     const enrollment = await createEnrollmentWithAddress(user);
    //     const ticketType = await createTicketType();
    //     const ticket = await createTicket(
    //         enrollment.id,
    //         ticketType.id,
    //         TicketStatus.RESERVED,
    //     );

    //     const payment = await createPayment(ticket.id, ticketType.price);

    //     const response = await server
    //         .get(`/payments?ticketId=${ticket.id}`)
    //         .set("Authorization", `Bearer ${token}`);

    //     expect(response.status).toEqual(httpStatus.OK);
    //     expect(response.body).toEqual({
    //         id: expect.any(Number),
    //         ticketId: ticket.id,
    //         value: ticketType.price,
    //         cardIssuer: payment.cardIssuer,
    //         cardLastDigits: payment.cardLastDigits,
    //         createdAt: expect.any(String),
    //         updatedAt: expect.any(String),
    //     });
    // });
});

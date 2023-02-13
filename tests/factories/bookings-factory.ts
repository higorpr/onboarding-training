import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { Booking, Enrollment, Hotel, Room, TicketType } from "@prisma/client";
const today = new Date();

export async function createHotel(): Promise<Hotel> {
    return await prisma.hotel.create({
        data: {
            name: faker.company.companyName(),
            image: faker.internet.url(),
            updatedAt: today,
        },
    });
}

export async function createRoom(
    hotelId: number,
    capacity: number,
): Promise<Room> {
    return await prisma.room.create({
        data: {
            name: faker.name.firstName(),
            capacity: capacity,
            hotelId: hotelId,
            updatedAt: today,
        },
    });
}
export async function createBooking(
    userId: number,
    roomId: number,
): Promise<Booking> {
    return await prisma.booking.create({
        data: {
            userId: userId,
            roomId: roomId,
            updatedAt: today,
        },
    });
}

export async function createEnrollment(userId: number): Promise<Enrollment> {
    return await prisma.enrollment.create({
        data: {
            name: faker.name.findName(),
            cpf: faker.datatype
                .number({
                    min: 10000000000,
                    max: 99999999999,
                    precision: 1,
                })
                .toString(),
            birthday: faker.date.past(),
            phone: faker.phone.phoneNumber("(##)#####-####"),
            userId: userId,
            updatedAt: today,
        },
    });
}

export async function createTicketType(
    isRemote: boolean,
    includesHotel: boolean,
): Promise<TicketType> {
    return await prisma.ticketType.create({
        data: {
            name: faker.name.jobDescriptor(),
            price: faker.datatype.number({ min: 100, max: 250, precision: 1 }),
            isRemote: isRemote,
            includesHotel: includesHotel,
            updatedAt: today,
        },
    });
}

export async function createTicket(
    enrollmentId: number,
    ticketTypeId: number,
    status: string,
) {
    return await prisma.ticket.create({
        data: {
            ticketTypeId: ticketTypeId,
            enrollmentId: enrollmentId,
            status: status === "PAID" ? "PAID" : "RESERVED",
            updatedAt: today,
        },
    });
}

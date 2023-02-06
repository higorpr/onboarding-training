import { prisma } from "@/config";
import {
    Hotel,
    Room,
    Enrollment,
    Ticket,
    Booking,
    TicketType,
} from "@prisma/client";

export type HotelAndRooms = Hotel & { Rooms: Room[] };

async function getAllHotels(): Promise<Hotel[]> {
    const hotels = await prisma.hotel.findMany({});
    return hotels;
}
async function getRooms(hotelId: number): Promise<HotelAndRooms> {
    const rooms = await prisma.hotel.findUnique({
        where: {
            id: hotelId,
        },
        include: {
            Rooms: true,
        },
    });

    return rooms;
}

async function getEnrollemntInfo(userId: number): Promise<Enrollment> {
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            userId: userId,
        },
    });
    return enrollment;
}

async function getTicketInfo(enrollmentId: number): Promise<Ticket> {
    const ticket = await prisma.ticket.findFirst({
        where: {
            enrollmentId: enrollmentId,
        },
    });
    return ticket;
}

async function getBookingInfo(userId: number): Promise<Booking> {
    const booking = await prisma.booking.findFirst({
        where: {
            userId: userId,
        },
    });
    return booking;
}

async function getTicketTypeInfo(ticketTypeId: number): Promise<TicketType> {
    return await prisma.ticketType.findFirst({
        where: {
            id: ticketTypeId,
        },
    });
}

const hotelsRepository = {
    getAllHotels,
    getRooms,
    getEnrollemntInfo,
    getTicketInfo,
    getBookingInfo,
    getTicketTypeInfo,
};

export { hotelsRepository };

import { prisma } from "@/config";
import { Booking, Room } from "@prisma/client";

export type BookingInfo = { id: number; Room: Room };

async function getBooking(userId: number): Promise<BookingInfo> {
    return await prisma.booking.findFirst({
        where: {
            userId: userId,
        },
        select: {
            id: true,
            Room: true,
        },
    });
}

async function getRoom(roomId: number): Promise<Room> {
    return await prisma.room.findFirst({
        where: {
            id: roomId,
        },
    });
}

export type ticketInfo = {
    isRemote: boolean;
    includesHotel: boolean;
    isPaid: boolean;
};

async function getTicketInfo(enrollmentId: number): Promise<ticketInfo> {
    const ticket = await prisma.ticket.findFirst({
        where: {
            enrollmentId: enrollmentId,
        },
    });

    if (!ticket) {
        return null;
    }

    const ticketType = await prisma.ticketType.findFirst({
        where: {
            id: ticket.ticketTypeId,
        },
    });

    const ticketObj = {
        isRemote: ticketType.isRemote,
        includesHotel: ticketType.includesHotel,
        isPaid: ticket.status === "PAID" ? true : false,
    };

    return ticketObj;
}

async function postBooking(userId: number, roomId: number): Promise<Booking> {
    const today = new Date();
    await prisma.room.update({
        where: {
            id: roomId,
        },
        data: {
            capacity: {
                decrement: 1,
            },
        },
    });
    return await prisma.booking.create({
        data: {
            userId: userId,
            roomId: roomId,
            updatedAt: today,
        },
    });
}

const bookingsRepository = { getBooking, getRoom, getTicketInfo, postBooking };

export { bookingsRepository };

import { prisma } from "@/config";
import { Room } from "@prisma/client";

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

const bookingsRepository = { getBooking };

export { bookingsRepository };

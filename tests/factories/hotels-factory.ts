import { prisma } from "@/config";
import { Hotel } from "@prisma/client";

export async function createHotelAndRooms(): Promise<HotelAndRooms> {
    const now = new Date();
    const hotel = await prisma.hotel.create({
        data: {
            name: "Lorem",
            image: "http://www.lorem.com.br",
            updatedAt: now,
        },
    });

    const roomIds = [];
    for (let i = 0; i < 5; i++) {
        const room = await prisma.room.create({
            data: {
                name: `Lorem ${i}`,
                capacity: 2,
                hotelId: hotel.id,
                updatedAt: now,
            },
        });
        roomIds.push(room.id);
    }
    return { hotelId: hotel.id, roomIds: roomIds };
}

export type HotelAndRooms = { hotelId: number; roomIds: number[] };

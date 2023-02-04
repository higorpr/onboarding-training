import { prisma } from "@/config";

async function getAllHotels() {
    return await prisma.hotel.findMany();
}

async function getRooms(hotelId: number) {
    const rooms = await prisma.hotel.findMany({
        where: {
            id: hotelId,
        },
        include: {
            Rooms: true,
        },
    });

    return rooms;
}

const hotelsRepository = { getAllHotels, getRooms };

export { hotelsRepository };

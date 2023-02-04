import { prisma } from "@/config";

async function getAllHotels() {
    const hotels = await prisma.hotel.findMany({});
    return hotels;
}

async function getRooms(hotelId: number) {
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

const hotelsRepository = { getAllHotels, getRooms };

export { hotelsRepository };

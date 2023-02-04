import { hotelsRepository } from "@/repositories/hotels-repository";

async function getHotels() {
    const hotels = await hotelsRepository.getAllHotels();
    return hotels;
}

async function getHotelRooms(hotelId: number) {
    const rooms = await hotelsRepository.getRooms(hotelId);
    return rooms;
}

const hotelsService = { getHotels, getHotelRooms };
export { hotelsService };

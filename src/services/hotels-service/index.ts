import {
    HotelAndRooms,
    hotelsRepository,
} from "@/repositories/hotels-repository";
import { Booking, Enrollment, Hotel, Ticket, TicketType } from "@prisma/client";

async function getHotels(): Promise<Hotel[]> {
    const hotels = await hotelsRepository.getAllHotels();
    return hotels;
}

async function getHotelRooms(hotelId: number): Promise<HotelAndRooms> {
    const rooms = await hotelsRepository.getRooms(hotelId);
    return rooms;
}

async function getEnrollmentFromUserId(userId: number): Promise<Enrollment> {
    const enrollment = await hotelsRepository.getEnrollemntInfo(userId);
    return enrollment;
}

async function getTicketFromEnrollmentId(
    enrollmentId: number,
): Promise<Ticket> {
    const ticket = await hotelsRepository.getTicketInfo(enrollmentId);
    return ticket;
}

async function getBookingFromUserId(userId: number): Promise<Booking> {
    const booking = await hotelsRepository.getBookingInfo(userId);
    return booking;
}

async function getTicketType(ticketTypeId: number): Promise<TicketType> {
    const ticketType = await hotelsRepository.getTicketTypeInfo(ticketTypeId);
    return ticketType;
}

const hotelsService = {
    getHotels,
    getHotelRooms,
    getEnrollmentFromUserId,
    getTicketFromEnrollmentId,
    getBookingFromUserId,
    getTicketType,
};

export { hotelsService };

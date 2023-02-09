import {
    BookingInfo,
    bookingsRepository,
} from "@/repositories/bookings-repository";

async function getBooking(userId: number): Promise<BookingInfo> {
    const booking = await bookingsRepository.getBooking(userId);
    return booking;
}

const bookingsService = { getBooking };

export { bookingsService };

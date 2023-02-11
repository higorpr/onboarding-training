import {
    BookingInfo,
    bookingsRepository,
} from "@/repositories/bookings-repository";
import { getEnrollmentId } from "@/repositories/tickets-repository";
import { Booking } from "@prisma/client";
import { businessRuleError, fullRoomError, roomNotFoundError } from "./errors";

async function getBooking(userId: number): Promise<BookingInfo> {
    const booking = await bookingsRepository.getBooking(userId);
    return booking;
}

async function getBookingByBookingId(bookingId: number): Promise<Booking> {
    const booking = await bookingsRepository.getBookingByBookingId(bookingId);
    return booking;
}

async function checkRoomAvailability(roomId: number): Promise<void> {
    const roomInfo = await bookingsRepository.getRoom(roomId);
    if (!roomInfo) {
        throw roomNotFoundError();
    }

    if (roomInfo.capacity === 0) {
        throw fullRoomError();
    }
}

async function checkBusinessRule(userId: number) {
    const enrollmentId = await getEnrollmentId(userId);
    if (!enrollmentId) {
        throw businessRuleError();
    }

    const ticketInfo = await bookingsRepository.getTicketInfo(enrollmentId);
    if (!ticketInfo) {
        throw businessRuleError();
    }

    if (ticketInfo.includesHotel === false) {
        throw businessRuleError();
    }

    if (ticketInfo.isPaid === false) {
        throw businessRuleError();
    }

    if (ticketInfo.isRemote === true) {
        throw businessRuleError();
    }
}

async function postBooking(userId: number, roomId: number): Promise<Booking> {
    const booking = await bookingsRepository.postBooking(userId, roomId);
    return booking;
}

async function checkUpdateBusinessRule(userId: number): Promise<void> {
    const booking = await bookingsRepository.retrieveBooking(userId);
    if (!booking) {
        throw businessRuleError();
    }
}

async function updateBooking(
    bookingId: number,
    oldRoomId: number,
    newRoomId: number,
): Promise<number> {
    const booking = await bookingsRepository.updateBooking(
        bookingId,
        oldRoomId,
        newRoomId,
    );
    return booking.id;
}

const bookingsService = {
    getBooking,
    checkRoomAvailability,
    checkBusinessRule,
    postBooking,
    checkUpdateBusinessRule,
    updateBooking,
    getBookingByBookingId,
};

export { bookingsService };

import { AuthenticatedRequest } from "@/middlewares";
import { bookingsService } from "@/services/bookings-service";
import { Response } from "express";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const userId = Number(req.userId);

    try {
        const bookingInfo = await bookingsService.getBooking(userId);
        if (!bookingInfo) {
            return res.sendStatus(404);
        }
        return res.send(bookingInfo);
    } catch (err) {
        return res.sendStatus(500);
    }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
    const userId = Number(req.userId);
    const roomId = Number(req.body.roomId);

    if (!roomId) {
        return res.sendStatus(404);
    }

    try {
        await bookingsService.checkRoomAvailability(roomId);
        await bookingsService.checkBusinessRule(userId);
        const booking = await bookingsService.postBooking(userId, roomId);
        const returnBody = { bookingId: booking.id };
        return res.status(200).send(returnBody);
    } catch (err) {
        if (err.name === "businessRuleError") {
            return res.status(403).send(err.message);
        }

        if (err.name === "roomNotFoundError") {
            return res.status(404).send(err.message);
        }

        if (err.name === "fullRoomError") {
            return res.status(403).send(err.message);
        }

        return res.sendStatus(500);
    }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
    const userId = Number(req.userId);
    const roomId = Number(req.body.roomId);
    const bookingId = Number(req.params.bookingId);

    if (!roomId || !bookingId) {
        return res.sendStatus(404);
    }

    try {
        // check rules
        await bookingsService.checkRoomAvailability(roomId);
        await bookingsService.checkUpdateBusinessRule(userId);

        // alter booking
        const oldBooking = await bookingsService.getBookingByBookingId(
            bookingId,
        );

        const oldRoomId = oldBooking.roomId;
        const newRoomId = roomId;

        if (oldRoomId === newRoomId) {
            return res.sendStatus(409);
        }

        const newBookingId = await bookingsService.updateBooking(
            oldBooking.id,
            oldRoomId,
            newRoomId,
        );
        const returnBody = { bookingId: newBookingId };

        return res.status(200).send(returnBody);
    } catch (err) {
        if (err.name === "businessRuleError") {
            return res.status(403).send(err.message);
        }

        if (err.name === "roomNotFoundError") {
            return res.status(404).send(err.message);
        }

        if (err.name === "fullRoomError") {
            return res.status(403).send(err.message);
        }

        return res.sendStatus(500);
    }
}

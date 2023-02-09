import { AuthenticatedRequest } from "@/middlewares";
import { bookingsService } from "@/services/bookings-service";
import { Response } from "express";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId;

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

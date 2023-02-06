import { hotelsService } from "@/services/hotels-service";
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./authentication-middleware";

export async function verifyExistance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) {
    const { userId } = req;

    try {
        // check for enrollment existence
        const enrollment = await hotelsService.getEnrollmentFromUserId(userId);

        if (!enrollment) {
            return res.sendStatus(404);
        }
        const enrollmentId = enrollment.id;

        // check for ticket existence
        const ticket = await hotelsService.getTicketFromEnrollmentId(
            enrollmentId,
        );

        if (!ticket) {
            return res.sendStatus(404);
        }
        // check for booking existence
        const booking = await hotelsService.getBookingFromUserId(userId);

        if (!booking) {
            return res.sendStatus(404);
        }
        // check if ticket is paid
        if (ticket.status !== "PAID") {
            return res.sendStatus(402);
        }

        // check if ticket is presential and if includes hotel
        const ticketType = await hotelsService.getTicketType(
            ticket.ticketTypeId,
        );

        if (
            ticketType.isRemote === true ||
            ticketType.includesHotel === false
        ) {
            return res.sendStatus(402);
        }
    } catch (err) {
        res.sendStatus(500);
    }

    next();
}

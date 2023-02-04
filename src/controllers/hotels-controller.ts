import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import { hotelsService } from "@/services/hotels-service";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    try {
        const hotels = await hotelsService.getHotels();
        return res.status(200).send(hotels);
    } catch (err) {
        return res.sendStatus(500);
    }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
    const { hotelId } = req;

    if (!Number(hotelId)) {
        return res.sendStatus(400);
    }
    try {
        const hotelRooms = await hotelsService.getHotelRooms(hotelId);
        return res.status(200).send(hotelRooms);
    } catch (err) {
        return res.sendStatus(500);
    }
}

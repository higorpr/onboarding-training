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
    const { hotelId } = req.params;

    if (!Number(hotelId)) {
        return res.sendStatus(400);
    }
    try {
        const hotels = await hotelsService.getHotels();
        const hotelIds = hotels.map((h) => h.id);
        if (!hotelIds.includes(Number(hotelId))) {
            return res.status(400).send("This Id has no Hotel");
        }
        const hotelRooms = await hotelsService.getHotelRooms(Number(hotelId));
        return res.status(200).send(hotelRooms);
    } catch (err) {
        return res.sendStatus(500);
    }
}

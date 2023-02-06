import { getHotelRooms, getHotels } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { verifyExistance } from "@/middlewares/hotels-middleware";
import { Router } from "express";

const hotelsRouter = Router();

hotelsRouter
    .all("/*", authenticateToken, verifyExistance)
    .get("/", getHotels)
    .get("/:hotelId", getHotelRooms);

export { hotelsRouter };

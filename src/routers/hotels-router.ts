import { getHotels } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelsRouter = Router();

hotelsRouter
    .all("/*", authenticateToken)
    .get("/hotels", getHotels)
    .get("/hotels/:hotelId");

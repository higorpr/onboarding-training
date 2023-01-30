import {
  createTicketRequest,
  getTickets,
  getTypes,
} from "@/controllers/tickets-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/types", getTypes)
  .get("/", getTickets)
  .post("/", createTicketRequest);

export { ticketsRouter };

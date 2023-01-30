import ticketsService from "@/services/tickets-service";
import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";

export async function getTypes(req: AuthenticatedRequest, res: Response) {
  try {
    const types = await ticketsService.getTypes();
    res.status(200).send(types);
  } catch (err) {
    res.sendStatus(500);
  }
}

export async function getTickets(req: AuthenticatedRequest, res: Response) {
  const userId = Number(req.userId);

  try {
    const tickets = await ticketsService.getUserTickets(userId);
    if (!tickets) {
      return res.sendStatus(404);
    }
    res.status(200).send(tickets);
  } catch (err) {
    res.sendStatus(500);
  }
}

export async function createTicketRequest(
  req: AuthenticatedRequest,
  res: Response,
) {
  const { ticketTypeId } = req.body;
  const userId = Number(req.userId);

  if (!ticketTypeId) {
    return res.sendStatus(400);
  }

  try {
    const enrollmentId = await ticketsService.getEnrollment(userId);
    if (!enrollmentId) {
      return res.sendStatus(404);
    }
    const response = await ticketsService.createPurchase(
      userId,
      enrollmentId,
      ticketTypeId,
    );
    return res.status(201).send(response);
  } catch (err) {
    res.sendStatus(500);
  }
}

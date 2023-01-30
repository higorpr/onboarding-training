import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import paymentsService from "@/services/payments-service";
import ticketsService from "@/services/tickets-service";

export async function getTicketInfo(req: AuthenticatedRequest, res: Response) {
  const { ticketId } = req.query;
  const userId = Number(req.userId);

  if (!Number(ticketId)) {
    return res.sendStatus(400);
  }

  try {
    const ticketOk = await paymentsService.ticketExists(Number(ticketId));
    if (!ticketOk) {
      return res.sendStatus(404);
    }

    const paymentResponse = await paymentsService.getTicketPaymentInfo(
      userId,
      Number(ticketId),
    );
    if (!paymentResponse) {
      return res.sendStatus(401);
    }
    return res.status(200).send(paymentResponse);
  } catch (err) {
    return res.sendStatus(500);
  }
}

export async function newPayment(req: AuthenticatedRequest, res: Response) {
  const paymentInfo = req.body as {
    ticketId: number;
    cardData: {
      issuer: string;
      number: number;
      name: string;
      expirationDate: Date;
      cvv: number;
    };
  };
  const ticketId = Number(paymentInfo.ticketId);
  const userId = req.userId;

  try {
    const idOk = await paymentsService.ticketExists(ticketId);
    if (!idOk) {
      return res.sendStatus(404);
    }

    const enrollmentId = await ticketsService.getEnrollment(userId);
    const userTicketOk = await paymentsService.matchingTicketToUser(
      enrollmentId,
      ticketId,
    );

    if (!userTicketOk) {
      return res.sendStatus(401);
    }

    await paymentsService.createPaymentEntry(
      ticketId,
      paymentInfo.cardData.issuer,
      paymentInfo.cardData.number,
    );

    const paymentResponse = await paymentsService.getLastPayment(ticketId);

    return res.status(200).send(paymentResponse);
  } catch (err) {
    return res.sendStatus(500);
  }
}

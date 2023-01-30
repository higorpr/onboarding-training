import {
  getTicketTypes,
  getTicket,
  TicketOutput,
  getEnrollmentId,
  createTicketReservation,
} from "@/repositories/tickets-repository";
import { TicketType } from "@prisma/client";

async function getTypes(): Promise<TicketType[]> {
  const types = await getTicketTypes();
  return types;
}

async function getUserTickets(userId: number): Promise<TicketOutput> {
  const tickets = await getTicket(userId);
  return tickets;
}

async function getEnrollment(userId: number): Promise<number> {
  const enrollmentId: number | null = await getEnrollmentId(userId);
  return enrollmentId;
}

async function createPurchase(
  userId: number,
  enrollmentId: number,
  ticketTypeId: number,
): Promise<TicketOutput> {
  await createTicketReservation(enrollmentId, ticketTypeId);
  const response = await getTicket(userId);
  return response;
}

const ticketsService = {
  getTypes,
  getUserTickets,
  getEnrollment,
  createPurchase,
};

export default ticketsService;

import { prisma } from "@/config";
import { Payment, Ticket } from "@prisma/client";

async function getTicketPayment(
  userId: number,
  ticketId: number,
): Promise<Payment> {
  return await prisma.payment.findFirst({
    where: {
      Ticket: {
        id: ticketId,
        Enrollment: {
          userId: userId,
        },
      },
    },
  });
}

async function getTicketInfo(ticketId: number): Promise<Ticket> {
  return await prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
  });
}

async function getTicketEnrollment(
  ticketId: number,
): Promise<{ enrollmentId: number }> {
  return await prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    select: {
      enrollmentId: true,
    },
  });
}

async function getTicketPrice(
  ticketId: number,
): Promise<{ TicketType: { price: number } }> {
  return await prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    select: {
      TicketType: {
        select: {
          price: true,
        },
      },
    },
  });
}

async function createPayment(
  ticketId: number,
  value: number,
  cardIssuer: string,
  cardLastDigits: string,
): Promise<void> {
  await prisma.payment.create({
    data: {
      ticketId: ticketId,
      value: value,
      cardIssuer: cardIssuer,
      cardLastDigits: cardLastDigits,
    },
  });
}

async function getPayment(ticketId: number): Promise<Payment> {
  return await prisma.payment.findFirst({
    where: { ticketId: ticketId },
  });
}

async function payTicket(ticketId: number): Promise<void> {
  await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: "PAID",
    },
  });
}

const paymentsRepository = {
  getTicketPayment,
  getTicketInfo,
  getTicketEnrollment,
  createPayment,
  getTicketPrice,
  getPayment,
  payTicket,
};

export default paymentsRepository;

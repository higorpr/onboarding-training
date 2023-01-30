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

const paymentsRepository = {
  getTicketPayment,
  getTicketInfo,
  getTicketEnrollment,
};

export default paymentsRepository;

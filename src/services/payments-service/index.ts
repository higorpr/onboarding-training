import paymentsRepository from "@/repositories/payments-repository";

async function ticketExists(ticketId: number): Promise<boolean> {
  const ticketInfo = await paymentsRepository.getTicketInfo(ticketId);
  if (!ticketInfo) {
    return false;
  }
  return true;
}

async function getTicketPaymentInfo(userId: number, ticketId: number) {
  const paymentInfo = await paymentsRepository.getTicketPayment(
    userId,
    ticketId,
  );
  return paymentInfo;
}

async function matchingTicketToUser(
  enrollmentId: number,
  ticketId: number,
): Promise<boolean> {
  const eId = await paymentsRepository.getTicketEnrollment(ticketId); // get enrollment id based on the ticket
  const ticketEnrollement = eId.enrollmentId;

  if (enrollmentId !== ticketEnrollement) {
    // compare enrollment ids from ticket and user
    return false;
  }

  return true;
}

const paymentsService = {
  getTicketPaymentInfo,
  ticketExists,
  matchingTicketToUser,
};

export default paymentsService;

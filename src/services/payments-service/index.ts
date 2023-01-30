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

async function createPaymentEntry(
  ticketId: number,
  cardIssuer: string,
  cardNumber: number,
): Promise<void> {
  const valueResponse = await paymentsRepository.getTicketPrice(ticketId);
  const value = valueResponse.TicketType.price;

  const cardLastDigits = cardNumber.toString().slice(-4);

  await paymentsRepository.createPayment(
    ticketId,
    value,
    cardIssuer,
    cardLastDigits,
  );

  await paymentsRepository.payTicket(ticketId);
}

async function getLastPayment(ticketId: number) {
  return await paymentsRepository.getPayment(ticketId);
}

const paymentsService = {
  getTicketPaymentInfo,
  ticketExists,
  matchingTicketToUser,
  createPaymentEntry,
  getLastPayment,
};

export default paymentsService;

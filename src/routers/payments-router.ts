import { getTicketInfo, newPayment } from "@/controllers/payments-controller";
import { authenticateToken, validatePaymentData } from "@/middlewares";
import { Router } from "express";

const paymentsRouter = Router();

paymentsRouter
  .all("/*", authenticateToken)
  .get("/", getTicketInfo)
  .post("/process", validatePaymentData, newPayment);

export { paymentsRouter };

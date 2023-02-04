import { prisma } from "@/config";
import { Ticket, TicketType } from "@prisma/client";

export type TicketOutput = Ticket & { TicketType: TicketType };

export async function getTicketTypes(): Promise<TicketType[]> {
    return await prisma.ticketType.findMany();
}

export async function getTicket(userId: number): Promise<TicketOutput> {
    return await prisma.ticket.findFirst({
        where: {
            Enrollment: {
                userId: userId,
            },
        },
        include: {
            TicketType: true,
        },
    });
}

export async function getEnrollmentId(userId: number): Promise<number | null> {
    const queryRes = await prisma.enrollment.findUnique({
        where: {
            userId: userId,
        },
        select: {
            id: true,
        },
    });
    if (!queryRes) return null;
    return queryRes.id;
}

export async function createTicketReservation(
    enrollmentId: number,
    ticketTypeId: number,
): Promise<void> {
    await prisma.ticket.create({
        data: {
            ticketTypeId: ticketTypeId,
            enrollmentId: enrollmentId,
            status: "RESERVED",
        },
    });
}

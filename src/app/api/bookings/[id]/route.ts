import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/utils";

// GET /api/bookings/[id] – Get booking details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        event: {
          include: { organizer: { select: { name: true } } },
        },
        payment: true,
      },
    });

    if (!booking || booking.userId !== userId) {
      return NextResponse.json({ error: "Buchung nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Booking GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

// PUT /api/bookings/[id] – Cancel booking with refund
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { action } = await request.json();

    if (action !== "cancel") {
      return NextResponse.json({ error: "Ungültige Aktion" }, { status: 400 });
    }

    // Cancel with refund in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: params.id },
        include: { payment: true, event: true },
      });

      if (!booking || booking.userId !== userId) {
        throw new Error("Buchung nicht gefunden");
      }

      if (booking.status !== "CONFIRMED") {
        throw new Error("Nur bestätigte Buchungen können storniert werden");
      }

      // Check if event hasn't started yet
      if (booking.event.startDate < new Date()) {
        throw new Error("Event hat bereits stattgefunden – Stornierung nicht möglich");
      }

      // Update booking status
      const updated = await tx.booking.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
      });

      // Refund payment
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: "REFUNDED" },
        });
      }

      // Release capacity
      await tx.event.update({
        where: { id: booking.eventId },
        data: { ticketsSold: { decrement: booking.ticketCount } },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId,
          eventId: booking.eventId,
          type: "REFUND_PROCESSED",
          title: "Stornierung bestätigt",
          message: `Deine Buchung für "${booking.event.title}" wurde storniert. Die Erstattung von ${booking.totalPrice}€ wird bearbeitet.`,
        },
      });

      return updated;
    });

    return NextResponse.json({ booking: result });
  } catch (error: any) {
    console.error("Booking PUT error:", error);
    return NextResponse.json({ error: error.message || "Stornierung fehlgeschlagen" }, { status: 400 });
  }
}

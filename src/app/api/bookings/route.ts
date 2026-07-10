import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId, generateConfirmationCode, generateTransactionId } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/bookings – Get current user's bookings
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        event: {
          select: {
            id: true, title: true, startDate: true, location: true,
            imageUrl: true, category: true, status: true,
          },
        },
        payment: true,
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Bookings GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

// POST /api/bookings – Create a new booking (atomic capacity check)
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { eventId, ticketCount, paymentMethod } = await request.json();

    if (!eventId || !ticketCount || ticketCount < 1) {
      return NextResponse.json({ error: "Event-ID und Ticketanzahl erforderlich" }, { status: 400 });
    }

    // Use a transaction for atomic booking + payment + capacity update
    const result = await prisma.$transaction(async (tx) => {
      // Get event with lock (serializable read)
      const event = await tx.event.findUnique({ where: { id: eventId } });

      if (!event) throw new Error("Event nicht gefunden");
      if (event.status !== "PUBLISHED") throw new Error("Event ist nicht buchbar");
      if (event.startDate < new Date()) throw new Error("Event hat bereits stattgefunden");

      const remaining = event.capacity - event.ticketsSold;
      if (ticketCount > remaining) {
        throw new Error(
          remaining === 0
            ? "Dieses Event ist ausverkauft"
            : `Nur noch ${remaining} Plätze verfügbar`
        );
      }

      // Atomic capacity update – prevents double-booking
      const updated = await tx.event.updateMany({
        where: {
          id: eventId,
          ticketsSold: { lte: event.capacity - ticketCount },
        },
        data: {
          ticketsSold: { increment: ticketCount },
        },
      });

      if (updated.count === 0) {
        throw new Error("Kapazität nicht mehr verfügbar (gleichzeitige Buchung)");
      }

      const totalPrice = Number(event.price) * ticketCount;
      const confirmationCode = generateConfirmationCode();
      const transactionId = generateTransactionId();

      // Create booking + payment
      const booking = await tx.booking.create({
        data: {
          userId,
          eventId,
          ticketCount,
          totalPrice,
          status: "CONFIRMED",
          confirmationCode,
          payment: {
            create: {
              amount: totalPrice,
              method: paymentMethod || "CREDIT_CARD",
              status: "COMPLETED",
              transactionId,
              paidAt: new Date(),
            },
          },
        },
        include: { payment: true, event: { select: { title: true } } },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          eventId,
          type: "BOOKING_CONFIRMED",
          title: "Buchung bestätigt! 🎉",
          message: `Deine Buchung für "${event.title}" (${ticketCount}x) wurde bestätigt. Code: ${confirmationCode}`,
        },
      });

      return booking;
    });

    return NextResponse.json({ booking: result }, { status: 201 });
  } catch (error: any) {
    console.error("Booking POST error:", error);
    const message = error.message || "Buchung fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

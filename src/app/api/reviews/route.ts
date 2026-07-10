import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/utils";

// POST /api/reviews – Create a review
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { eventId, rating, comment } = await request.json();

    if (!eventId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Event-ID und Bewertung (1-5) erforderlich" },
        { status: 400 }
      );
    }

    // Check if user has a confirmed booking for this event
    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        eventId,
        status: "CONFIRMED",
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Du kannst nur Events bewerten, die du gebucht hast" },
        { status: 403 }
      );
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existingReview) {
      // Update existing review
      const updated = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment },
        include: { user: { select: { name: true } } },
      });
      return NextResponse.json({ review: updated });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        eventId,
        rating,
        comment: comment || null,
      },
      include: { user: { select: { name: true } } },
    });

    // Notify organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true, title: true },
    });

    if (event) {
      await prisma.notification.create({
        data: {
          userId: event.organizerId,
          eventId,
          type: "REVIEW_RECEIVED",
          title: "Neue Bewertung ⭐",
          message: `Dein Event "${event.title}" hat eine neue ${rating}-Sterne Bewertung erhalten.`,
        },
      });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Review POST error:", error);
    return NextResponse.json({ error: "Bewertung fehlgeschlagen" }, { status: 500 });
  }
}

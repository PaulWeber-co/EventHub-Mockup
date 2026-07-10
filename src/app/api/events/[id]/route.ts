import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId, getCurrentUserRole } from "@/lib/utils";

// GET /api/events/[id] – Get event details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        organizer: { select: { id: true, name: true } },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { bookings: true, reviews: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 });
    }

    // Calculate average rating
    const avgRating =
      event.reviews.length > 0
        ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length
        : null;

    return NextResponse.json({ event, avgRating });
  } catch (error) {
    console.error("Event GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

// PUT /api/events/[id] – Update event (organizer only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const role = await getCurrentUserRole();

    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) {
      return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 });
    }

    if (event.organizerId !== userId && role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: any = {};

    const allowedFields = [
      "title", "description", "startDate", "endDate", "location",
      "locationAddress", "category", "price", "capacity", "imageUrl", "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "startDate" || field === "endDate") {
          updateData[field] = new Date(body[field]);
        } else if (field === "price") {
          updateData[field] = parseFloat(body[field]);
        } else if (field === "capacity") {
          updateData[field] = parseInt(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Prevent reducing capacity below tickets sold
    if (updateData.capacity !== undefined && updateData.capacity < event.ticketsSold) {
      return NextResponse.json(
        { error: `Kapazität kann nicht unter ${event.ticketsSold} (bereits verkauft) gesetzt werden` },
        { status: 400 }
      );
    }

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
    });

    // If event was cancelled, notify booked visitors
    if (body.status === "CANCELLED" && event.status !== "CANCELLED") {
      const bookings = await prisma.booking.findMany({
        where: { eventId: params.id, status: { in: ["CONFIRMED", "PENDING"] } },
        select: { userId: true },
      });

      if (bookings.length > 0) {
        await prisma.notification.createMany({
          data: bookings.map((b) => ({
            userId: b.userId,
            eventId: params.id,
            type: "EVENT_CANCELLED" as const,
            title: "Event abgesagt",
            message: `Die Veranstaltung "${event.title}" wurde leider abgesagt.`,
          })),
        });
      }
    }

    return NextResponse.json({ event: updated });
  } catch (error) {
    console.error("Event PUT error:", error);
    return NextResponse.json({ error: "Aktualisierung fehlgeschlagen" }, { status: 500 });
  }
}

// DELETE /api/events/[id] – Delete event (organizer only, drafts only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const role = await getCurrentUserRole();

    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) {
      return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 });
    }

    if (event.organizerId !== userId && role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
    }

    if (event.ticketsSold > 0) {
      return NextResponse.json(
        { error: "Event mit verkauften Tickets kann nicht gelöscht werden" },
        { status: 400 }
      );
    }

    await prisma.event.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event DELETE error:", error);
    return NextResponse.json({ error: "Löschen fehlgeschlagen" }, { status: 500 });
  }
}

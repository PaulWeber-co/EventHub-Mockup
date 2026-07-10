import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId, getCurrentUserRole } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/dashboard/stats – Organizer dashboard statistics
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const role = await getCurrentUserRole();

    if (!userId || (role !== "ORGANIZER" && role !== "ADMIN")) {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
    }

    const whereEvents = role === "ADMIN" ? {} : { organizerId: userId };

    const [events, totalBookings, revenue, recentBookings, eventStats] = await Promise.all([
      // Total events
      prisma.event.findMany({
        where: whereEvents,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { bookings: true, reviews: true } } },
      }),

      // Total bookings
      prisma.booking.count({
        where: {
          event: whereEvents,
          status: "CONFIRMED",
        },
      }),

      // Total revenue
      prisma.payment.aggregate({
        where: {
          booking: { event: whereEvents },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),

      // Recent bookings
      prisma.booking.findMany({
        where: { event: whereEvents },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { title: true } },
          payment: true,
        },
      }),

      // Events with capacity info
      prisma.event.findMany({
        where: { ...whereEvents, status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          capacity: true,
          ticketsSold: true,
          startDate: true,
          price: true,
        },
        orderBy: { startDate: "asc" },
      }),
    ]);

    const totalTicketsSold = events.reduce((sum, e) => sum + e.ticketsSold, 0);

    return NextResponse.json({
      stats: {
        totalEvents: events.length,
        publishedEvents: events.filter((e) => e.status === "PUBLISHED").length,
        totalBookings,
        totalRevenue: Number(revenue._sum.amount) || 0,
        totalTicketsSold,
      },
      events,
      recentBookings,
      eventStats,
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

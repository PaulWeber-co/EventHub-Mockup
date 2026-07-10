import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId, getCurrentUserRole } from "@/lib/utils";

// GET /api/events – List published events with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const date = searchParams.get("date") || "";
    const location = searchParams.get("location") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: any = { status: "PUBLISHED" };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (date === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.startDate = { gte: today, lt: tomorrow };
    } else if (date === "week") {
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      where.startDate = { gte: now, lte: nextWeek };
    } else if (date === "month") {
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      where.startDate = { gte: now, lte: nextMonth };
    } else if (date === "upcoming") {
      where.startDate = { gte: new Date() };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startDate: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          organizer: { select: { name: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Events GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Events" }, { status: 500 });
  }
}

// POST /api/events – Create a new event (organizer only)
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const role = await getCurrentUserRole();

    if (!userId || (role !== "ORGANIZER" && role !== "ADMIN")) {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, startDate, endDate, location, locationAddress, category, price, capacity, imageUrl, status } = body;

    if (!title || !description || !startDate || !location || !category || price === undefined || !capacity) {
      return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        organizerId: userId,
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        location,
        locationAddress: locationAddress || null,
        category,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        imageUrl: imageUrl || null,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Events POST error:", error);
    return NextResponse.json({ error: "Event konnte nicht erstellt werden" }, { status: 500 });
  }
}

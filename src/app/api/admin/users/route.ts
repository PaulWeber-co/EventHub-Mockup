import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId, getCurrentUserRole } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/admin/users – List all users (admin only)
export async function GET() {
  try {
    const role = await getCurrentUserRole();
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            organizedEvents: true,
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}

// PUT /api/admin/users – Update user role (admin only)
export async function PUT(request: Request) {
  try {
    const role = await getCurrentUserRole();
    const currentUserId = await getCurrentUserId();

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
    }

    const { userId, newRole } = await request.json();

    if (userId === currentUserId) {
      return NextResponse.json({ error: "Eigene Rolle kann nicht geändert werden" }, { status: 400 });
    }

    const validRoles = ["VISITOR", "ORGANIZER", "ADMIN"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: "Ungültige Rolle" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Admin users PUT error:", error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import User from "@/models/User";

const DEFAULT_MEMBERS = [
  { id: "1", name: "Aman Sharma", email: "aman@workflow.ai", role: "Admin", status: "Active", teamName: "Dev Team", initial: "AS", color: "bg-indigo-500" },
  { id: "2", name: "Rahul Verma", email: "rahul@workflow.ai", role: "Collaborator", status: "Active", teamName: "Design Team", initial: "RV", color: "bg-emerald-500" },
  { id: "3", name: "Priya Patel", email: "priya@workflow.ai", role: "Agent", status: "Active", teamName: "Dev Team", initial: "PP", color: "bg-pink-500" },
  { id: "4", name: "Rohan Das", email: "rohan@workflow.ai", role: "Agent", status: "Invited", teamName: "Management", initial: "RD", color: "bg-amber-500" }
];

export async function GET() {
  try {
    const UserCollection = await getCollection("User", User);
    const dbUsers = await UserCollection.find();

    if (!dbUsers || dbUsers.length === 0) {
      return NextResponse.json(DEFAULT_MEMBERS);
    }

    const formatted = dbUsers.map((u: any, idx: number) => ({
      id: u.id || u._id || String(idx + 1),
      name: u.name,
      email: u.email,
      role: u.role || "Agent",
      status: u.status || "Active",
      teamName: u.teamName || "Dev Team",
      initial: u.avatar || u.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U",
      color: u.color || "bg-indigo-500"
    }));

    return NextResponse.json(formatted, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error) {
    console.error("GET Teams Error:", error);
    return NextResponse.json(DEFAULT_MEMBERS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, teamName, initial, color } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    const UserCollection = await getCollection("User", User);
    const existing = await UserCollection.findOne({ email });

    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const newUser = await UserCollection.create({
      id: String(Date.now()),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || "Agent",
      status: "Invited",
      teamName: teamName || "Dev Team",
      avatar: initial || name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
      color: color || "bg-blue-500"
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("POST Team Error:", error);
    return NextResponse.json({ error: "Failed to invite team member" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const UserCollection = await getCollection("User", User);
    const updated = await UserCollection.findByIdAndUpdate(id, updates);

    return NextResponse.json(updated || { id, ...updates }, { status: 200 });
  } catch (error) {
    console.error("PUT Team Error:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Member ID parameter is required" }, { status: 400 });
    }

    const UserCollection = await getCollection("User", User);
    await UserCollection.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Member removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Team Error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}

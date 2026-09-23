import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import Ticket from "@/models/Ticket";

export async function GET() {
    try {
        const TicketCollection = await getCollection("Ticket", Ticket);
        const tickets = await TicketCollection.find();
        return NextResponse.json(tickets, {
            headers: { "Cache-Control": "no-store, max-age=0" }
        });
    } catch (error: any) {
        console.error("GET Calendar Tickets Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, owner, date } = body;

        if (!name || !date) {
            return NextResponse.json({ error: "Name and Date are required" }, { status: 400 });
        }

        const TicketCollection = await getCollection("Ticket", Ticket);
        const newTicket = await TicketCollection.create({
            name,
            owner: owner || "Aman Sharma",
            date,
            status: "In Progress",
            group: "active",
            description: "No custom diagnostic info configured yet. Update details internally.",
            logs: [{ id: String(Date.now()), text: "Ticket deployed to live operation panel.", time: "Just Now" }]
        });

        return NextResponse.json(newTicket, { status: 201 });
    } catch (error) {
        console.error("POST Calendar Ticket Error:", error);
        return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, status, owner, date, group, logs } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const TicketCollection = await getCollection("Ticket", Ticket);
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (status !== undefined) updates.status = status;
        if (owner !== undefined) updates.owner = owner;
        if (date !== undefined) updates.date = date;
        if (group !== undefined) updates.group = group;
        if (logs !== undefined) updates.logs = logs;

        const updatedTicket = await TicketCollection.findByIdAndUpdate(id, updates);
        return NextResponse.json(updatedTicket, { status: 200 });
    } catch (error) {
        console.error("PUT Calendar Ticket Error:", error);
        return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const TicketCollection = await getCollection("Ticket", Ticket);
        await TicketCollection.findByIdAndDelete(id);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("DELETE Calendar Ticket Error:", error);
        return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
    }
}
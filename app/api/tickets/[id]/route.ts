import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import Ticket from "@/models/Ticket";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const TicketCollection = await getCollection("Ticket", Ticket);
        const ticket = await TicketCollection.findOne({ id });
        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }
        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error("GET Ticket Detail Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { name, owner, date, description, status, group, logs, newComment } = body;
        const TicketCollection = await getCollection("Ticket", Ticket);
        const existingTicket = await TicketCollection.findOne({ id });
        if (!existingTicket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }
        // Build the updates object
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (owner !== undefined) updates.owner = owner;
        if (date !== undefined) updates.date = date;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;
        if (group !== undefined) updates.group = group;
        if (logs !== undefined) updates.logs = logs;
        // Handle posting a comment to logs
        if (newComment !== undefined && newComment.trim() !== "") {
            const currentLogs = existingTicket.logs || [];
            updates.logs = [
                ...currentLogs,
                {
                    id: Date.now().toString(),
                    text: newComment,
                    time: "Just Now",
                    createdAt: new Date().toISOString()
                }
            ];
        }
        const updatedTicket = await TicketCollection.findByIdAndUpdate(id, updates);
        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        console.error("PUT Ticket Detail Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const TicketCollection = await getCollection("Ticket", Ticket);
        const success = await TicketCollection.findByIdAndDelete(id);
        if (!success) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Ticket deleted successfully" });
    } catch (error: any) {
        console.error("DELETE Ticket Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
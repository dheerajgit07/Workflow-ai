import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import Ticket from "@/models/Ticket";
export async function GET() {
    try {
        const TicketCollection = await getCollection("Ticket", Ticket);
        const tickets = await TicketCollection.find();
        return NextResponse.json(tickets);
    } catch (error: any) {
        console.error("GET Tickets Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, owner, date, description, status, group } = body;
        if (!name || !owner || !date) {
            return NextResponse.json({ error: "Please enter name, owner, and date" }, { status: 400 });
        }
        const TicketCollection = await getCollection("Ticket", Ticket);
        const newTicket = await TicketCollection.create({
            name,
            owner,
            date,
            description: description || "",
            status: status || "In Progress",
            group: group || "active",
            logs: [
                { text: "Ticket deployed to live operation panel.", time: "Just Now" }
            ]
        });
        return NextResponse.json(newTicket, { status: 201 });
    } catch (error: any) {
        console.error("POST Ticket Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
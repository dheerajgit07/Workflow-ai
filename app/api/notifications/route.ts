import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import Notification from "@/models/Notification";
export async function GET() {
    try {
        const NotificationCollection = await getCollection("Notification", Notification);
        const notifications = await NotificationCollection.find();
        return NextResponse.json(notifications);
    } catch (error: any) {
        console.error("GET Notifications Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, message } = body;
        if (!title || !message) {
            return NextResponse.json({ error: "Please enter title and message" }, { status: 400 });
        }
        const NotificationCollection = await getCollection("Notification", Notification);
        const newNotification = await NotificationCollection.create({
            title,
            message,
            read: false,
            time: "Just Now"
        });
        return NextResponse.json(newNotification, { status: 201 });
    } catch (error: any) {
        console.error("POST Notification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        if (!id) {
            return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
        }
        const NotificationCollection = await getCollection("Notification", Notification);
        const updated = await NotificationCollection.findByIdAndUpdate(id, updates);
        if (!updated) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("PUT Notification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            // Clear all notifications if no ID is passed
            const NotificationCollection = await getCollection("Notification", Notification);
            const notifications = await NotificationCollection.find();
            for (const item of notifications) {
                await NotificationCollection.findByIdAndDelete(item.id || item._id);
            }
            return NextResponse.json({ success: true, message: "All notifications cleared" });
        }
        const NotificationCollection = await getCollection("Notification", Notification);
        const success = await NotificationCollection.findByIdAndDelete(id);
        if (!success) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Notification deleted successfully" });
    } catch (error: any) {
        console.error("DELETE Notification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
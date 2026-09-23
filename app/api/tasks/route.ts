import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import Task from "@/models/Task";
export async function GET() {
    try {
        const TaskCollection = await getCollection("Task", Task);
        const tasks = await TaskCollection.find();
        return NextResponse.json(tasks);
    } catch (error: any) {
        console.error("GET Tasks Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, assignee, due, priority, status } = body;
        if (!title || !due) {
            return NextResponse.json({ error: "Please enter title and due date" }, { status: 400 });
        }
        const TaskCollection = await getCollection("Task", Task);
        const newTask = await TaskCollection.create({
            title,
            assignee: assignee || "Unassigned",
            due,
            priority: priority || "Medium",
            status: status || "To Do"
        });
        return NextResponse.json(newTask, { status: 201 });
    } catch (error: any) {
        console.error("POST Task Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        if (!id) {
            return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
        }
        const TaskCollection = await getCollection("Task", Task);
        const updated = await TaskCollection.findByIdAndUpdate(id, updates);

        if (!updated) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("PUT Task Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
        }
        const TaskCollection = await getCollection("Task", Task);
        const success = await TaskCollection.findByIdAndDelete(id);
        if (!success) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Task deleted successfully" });
    } catch (error: any) {
        console.error("DELETE Task Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

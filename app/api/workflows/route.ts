import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import Workflow from "@/models/Workflow";
export async function GET() {
    try {
        const WorkflowCollection = await getCollection("Workflow", Workflow);
        const workflows = await WorkflowCollection.find();
        return NextResponse.json(workflows);
    } catch (error: any) {
        console.error("GET Workflows Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, assignee, timeline, status, progress, description } = body;
        if (!name || !assignee || !timeline) {
            return NextResponse.json({ error: "Please enter name, assignee, and timeline" }, { status: 400 });
        }
        const WorkflowCollection = await getCollection("Workflow", Workflow);
        const newWorkflow = await WorkflowCollection.create({
            name,
            assignee,
            timeline,
            status: status || "In Progress",
            progress: progress || 0,
            analytics: { views: 1, updates: 0 },
            history: [
                { action: "Workflow initialized in operational hub.", user: "System", time: "Just Now" }
            ]
        });
        return NextResponse.json(newWorkflow, { status: 201 });
    } catch (error: any) {
        console.error("POST Workflow Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
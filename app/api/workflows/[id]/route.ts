import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import Workflow from "@/models/Workflow";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const WorkflowCollection = await getCollection("Workflow", Workflow);
        const workflow = await WorkflowCollection.findOne({ id });
        if (!workflow) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }
        // Optional: Increment views on load
        const currentViews = (workflow.analytics?.views || 0) + 1;
        await WorkflowCollection.findByIdAndUpdate(id, {
            "analytics.views": currentViews
        });
        return NextResponse.json({
            ...workflow,
            analytics: {
                ...workflow.analytics,
                views: currentViews
            }
        });
    } catch (error: any) {
        console.error("GET Workflow Detail Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { name, assignee, timeline, status, progress, newAction, user } = body;
        const WorkflowCollection = await getCollection("Workflow", Workflow);
        const existingWorkflow = await WorkflowCollection.findOne({ id });
        if (!existingWorkflow) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (assignee !== undefined) updates.assignee = assignee;
        if (timeline !== undefined) updates.timeline = timeline;
        if (status !== undefined) updates.status = status;
        if (progress !== undefined) updates.progress = progress;
        // Increment updates count
        const currentUpdatesCount = (existingWorkflow.analytics?.updates || 0) + 1;
        updates["analytics.updates"] = currentUpdatesCount;
        // Record change to history
        if (newAction !== undefined && newAction.trim() !== "") {
            const currentHistory = existingWorkflow.history || [];
            updates.history = [
                ...currentHistory,
                {
                    id: Date.now().toString(),
                    action: newAction,
                    user: user || "System",
                    time: "Just Now",
                    createdAt: new Date().toISOString()
                }
            ];
        } else {
            // Auto generate a history entry if something changed
            const currentHistory = existingWorkflow.history || [];
            let autoAction = "Parameters updated";
            if (status !== undefined && status !== existingWorkflow.status) {
                autoAction = `Status updated to ${status}`;
            } else if (progress !== undefined && progress !== existingWorkflow.progress) {
                autoAction = `Progress updated to ${progress}%`;
            } else if (assignee !== undefined && assignee !== existingWorkflow.assignee) {
                autoAction = `Assignee changed to ${assignee}`;
            }
            updates.history = [
                ...currentHistory,
                {
                    id: Date.now().toString(),
                    action: autoAction,
                    user: user || "System",
                    time: "Just Now",
                    createdAt: new Date().toISOString()
                }
            ];
        }
        const updatedWorkflow = await WorkflowCollection.findByIdAndUpdate(id, updates);
        return NextResponse.json(updatedWorkflow);
    } catch (error: any) {
        console.error("PUT Workflow Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const WorkflowCollection = await getCollection("Workflow", Workflow);
        const success = await WorkflowCollection.findByIdAndDelete(id);
        if (!success) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Workflow deleted successfully" });
    } catch (error: any) {
        console.error("DELETE Workflow Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
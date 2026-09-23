import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import Project from "@/models/Project";
export async function GET() {
    try {
        const ProjectCollection = await getCollection("Project", Project);
        const projects = await ProjectCollection.find();
        return NextResponse.json(projects);
    } catch (error: any) {
        console.error("GET Projects Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, timeline, budget, status, progress, client } = body;
        if (!name || !timeline) {
            return NextResponse.json({ error: "Please enter name and timeline" }, { status: 400 });
        }
        const ProjectCollection = await getCollection("Project", Project);
        const newProject = await ProjectCollection.create({
            name,
            timeline,
            budget: budget || "$0",
            status: status || "In Progress",
            progress: progress || 0,
            client: client || "In-House"
        });
        return NextResponse.json(newProject, { status: 201 });
    } catch (error: any) {
        console.error("POST Project Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        if (!id) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }
        const ProjectCollection = await getCollection("Project", Project);
        const updated = await ProjectCollection.findByIdAndUpdate(id, updates);
        if (!updated) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("PUT Project Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }
        const ProjectCollection = await getCollection("Project", Project);
        const success = await ProjectCollection.findByIdAndDelete(id);
        if (!success) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Project deleted successfully" });
    } catch (error: any) {
        console.error("DELETE Project Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
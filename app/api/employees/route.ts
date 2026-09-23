import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import Employee from "@/models/Employee";
export async function GET() {
    try {
        const EmployeeCollection = await getCollection("Employee", Employee);
        const employees = await EmployeeCollection.find();
        return NextResponse.json(employees);
    } catch (error: any) {
        console.error("GET Employees Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, role, performance, activeTickets, status } = body;
        if (!name || !role) {
            return NextResponse.json({ error: "Please enter name and role" }, { status: 400 });
        }
        const EmployeeCollection = await getCollection("Employee", Employee);
        const newEmployee = await EmployeeCollection.create({
            name,
            role,
            performance: performance || 90,
            activeTickets: activeTickets || 0,
            status: status || "Active"
        });
        return NextResponse.json(newEmployee, { status: 201 });
    } catch (error: any) {
        console.error("POST Employee Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        if (!id) {
            return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
        }
        const EmployeeCollection = await getCollection("Employee", Employee);
        const updated = await EmployeeCollection.findByIdAndUpdate(id, updates);
        if (!updated) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("PUT Employee Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
        }
        const EmployeeCollection = await getCollection("Employee", Employee);
        const success = await EmployeeCollection.findByIdAndDelete(id);
        if (!success) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Employee deleted successfully" });
    } catch (error: any) {
        console.error("DELETE Employee Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { localDb } from "@/lib/localDb";

let REPORTS_DATABASE = [
  { id: "REP-01", department: "Engineering Ecosystem", budgetAllocated: 500000, budgetUsed: 412000, targetOutput: 90, currentOutput: 86, headcount: 24, status: "On Track", manager: "Dheeraj Kamboj", startDate: "2026-01-10" },
  { id: "REP-02", department: "UI/UX Design Studio", budgetAllocated: 180000, budgetUsed: 165000, targetOutput: 95, currentOutput: 92, headcount: 8, status: "On Track", manager: "Aarav Sharma", startDate: "2026-02-15" },
  { id: "REP-03", department: "Growth Marketing", budgetAllocated: 320000, budgetUsed: 315000, targetOutput: 85, currentOutput: 71, headcount: 12, status: "At Risk", manager: "Neha Verma", startDate: "2026-01-05" },
  { id: "REP-04", department: "Global Finance Desk", budgetAllocated: 120000, budgetUsed: 98000, targetOutput: 98, currentOutput: 97, headcount: 4, status: "On Track", manager: "Rohan Gupta", startDate: "2026-03-01" },
  { id: "REP-05", department: "Talent & Culture", budgetAllocated: 150000, budgetUsed: 148000, targetOutput: 90, currentOutput: 64, headcount: 6, status: "Critical", manager: "Priya Nair", startDate: "2026-01-20" }
];

export async function GET() {
  try {
    const list = await localDb.find("reports");
    if (!list || list.length === 0) {
      return NextResponse.json(REPORTS_DATABASE);
    }
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(REPORTS_DATABASE);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { department, budgetAllocated, headcount, manager } = body;

    if (!department || String(department).trim() === "") {
      return NextResponse.json({ error: "Department name required" }, { status: 400 });
    }

    const newRow = {
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      department: department.trim(),
      budgetAllocated: Number(budgetAllocated) || 200000,
      budgetUsed: 0,
      targetOutput: 90,
      currentOutput: 75,
      headcount: Number(headcount) || 1,
      status: "On Track",
      manager: manager?.trim() || "Unassigned",
      startDate: new Date().toISOString().split("T")[0]
    };

    const saved = await localDb.create("reports", newRow);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, field, value, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const updates = field ? { [field]: value, ...rest } : rest;

    if (field === "currentOutput" || updates.currentOutput !== undefined) {
      const numVal = Number(updates.currentOutput ?? value);
      if (numVal < 70) updates.status = "Critical";
      else if (numVal < 85) updates.status = "At Risk";
      else updates.status = "On Track";
    }

    const updated = await localDb.findByIdAndUpdate("reports", id, updates);
    return NextResponse.json(updated || { id, ...updates });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Report ID parameter is required" }, { status: 400 });
    }

    await localDb.findByIdAndDelete("reports", id);
    return NextResponse.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}

// app/api/reports/route.ts
import { NextResponse } from "next/server";

// Enterprise Global Mock Ledger
let REPORTS_DATABASE = [
  { id: "REP-01", department: "Engineering Ecosystem", budgetAllocated: 500000, budgetUsed: 412000, targetOutput: 90, currentOutput: 86, headcount: 24, status: "On Track" as const },
  { id: "REP-02", department: "UI/UX Design Studio", budgetAllocated: 180000, budgetUsed: 165000, targetOutput: 95, currentOutput: 92, headcount: 8, status: "On Track" as const },
  { id: "REP-03", department: "Growth Marketing", budgetAllocated: 320000, budgetUsed: 315000, targetOutput: 85, currentOutput: 71, headcount: 12, status: "At Risk" as const },
  { id: "REP-04", department: "Global Finance Desk", budgetAllocated: 120000, budgetUsed: 98000, targetOutput: 98, currentOutput: 97, headcount: 4, status: "On Track" as const },
  { id: "REP-05", department: "Talent & Culture", budgetAllocated: 150000, budgetUsed: 148000, targetOutput: 90, currentOutput: 64, headcount: 6, status: "Critical" as const },
];

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: REPORTS_DATABASE }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Database registry error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { department } = body;

    if (!department || department.trim() === "") {
      return NextResponse.json({ success: false, message: "Department name required" }, { status: 400 });
    }

    const newRow = {
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      department: department.trim(),
      budgetAllocated: 250000,
      budgetUsed: 0,
      targetOutput: 90,
      currentOutput: 75,
      headcount: 1,
      status: "On Track" as const
    };

    REPORTS_DATABASE.push(newRow);
    return NextResponse.json({ success: true, data: newRow }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Payload injection failed" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, field, value } = body;

    const rowIndex = REPORTS_DATABASE.findIndex(row => row.id === id);
    if (rowIndex === -1) {
      return NextResponse.json({ success: false, message: "Record node absent" }, { status: 404 });
    }

    let updatedRow = { ...REPORTS_DATABASE[rowIndex], [field]: value };

    if (field === "currentOutput") {
      const numVal = Number(value);
      if (numVal < 70) updatedRow.status = "Critical";
      else if (numVal < 85) updatedRow.status = "At Risk";
      else updatedRow.status = "On Track";
    }

    REPORTS_DATABASE[rowIndex] = updatedRow;
    return NextResponse.json({ success: true, data: updatedRow }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Mutation failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing reference ID parameter" }, { status: 400 });
    }

    REPORTS_DATABASE = REPORTS_DATABASE.filter(row => row.id !== id);
    return NextResponse.json({ success: true, message: "Pruned successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Deletion failed" }, { status: 500 });
  }
}
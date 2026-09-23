import { NextResponse } from "next/server";

// --- STRUCTURED TYPES matching frontend schema ---
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: "Engineering" | "Design" | "Marketing" | "HR" | "Finance";
  status: "Active" | "On Leave" | "Remote";
  joinDate: string;
  location: string;
  performanceScore: number;
}

// Enterprise In-Memory Database State
let employeesDatabase: Employee[] = [
  { id: "EMP-101", name: "Vikram Malhotra", email: "v.malhotra@workflow.ai", phone: "+91 98765 43210", role: "Principal Engineer", department: "Engineering", status: "Active", joinDate: "2023-04-12", location: "Bangalore, IN", performanceScore: 4.8 },
  { id: "EMP-102", name: "Ananya Iyer", email: "a.iyer@workflow.ai", phone: "+91 98123 45678", role: "UI/UX Lead", department: "Design", status: "Active", joinDate: "2024-01-15", location: "Mumbai, IN", performanceScore: 4.9 },
  { id: "EMP-103", name: "Kabir Singh", email: "k.singh@workflow.ai", phone: "+91 99988 77766", role: "DevOps Architect", department: "Engineering", status: "Remote", joinDate: "2022-11-01", location: "Delhi, IN", performanceScore: 4.5 },
  { id: "EMP-104", name: "Meera Nair", email: "m.nair@workflow.ai", phone: "+91 95554 33221", role: "HR Director", department: "HR", status: "On Leave", joinDate: "2021-06-20", location: "Pune, IN", performanceScore: 4.7 },
  { id: "EMP-105", name: "Rohan Kapoor", email: "r.kapoor@workflow.ai", phone: "+91 94445 55667", role: "Growth Marketer", department: "Marketing", status: "Active", joinDate: "2024-03-01", location: "Remote", performanceScore: 4.2 }
];

// ─── 1. GET: FETCH ALL EMPLOYEES ───
export async function GET() {
  try {
    return NextResponse.json(employeesDatabase, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workforce data matrix" }, { status: 500 });
  }
}

// ─── 2. POST: ONBOARD NEW EMPLOYEE ───
export async function POST(request: Request) {
  try {
    const body: Employee = await request.json();
    
    // Strict structural fallback validation
    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Missing required core payload parameters (name, email)" }, { status: 400 });
    }

    const newRecord: Employee = {
      ...body,
      id: body.id || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      performanceScore: body.performanceScore || 5.0
    };

    // Prepend into data cluster
    employeesDatabase = [newRecord, ...employeesDatabase];
    
    return NextResponse.json({ message: "Employee committed successfully", record: newRecord }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Data serialization parse failed" }, { status: 400 });
  }
}

// ─── 3. PUT: LIVE INLINE / FULL UPDATES ───
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updatedFields } = body;

    if (!id) {
      return NextResponse.json({ error: "Primary identifier missing (id)" }, { status: 400 });
    }

    const targetIndex = employeesDatabase.findIndex(emp => emp.id === id);
    if (targetIndex === -1) {
      return NextResponse.json({ error: "Target node not located inside cluster" }, { status: 404 });
    }

    // Dynamic key-value merging architecture
    employeesDatabase[targetIndex] = {
      ...employeesDatabase[targetIndex],
      ...updatedFields
    };

    return NextResponse.json({ 
      message: "Node optimized and saved", 
      updatedRecord: employeesDatabase[targetIndex] 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Mutation streaming injection crashed" }, { status: 500 });
  }
}

// ─── 4. DELETE: OFFBOARD AN EMPLOYEE ───
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Query parameter 'id' is required for destruction context" }, { status: 400 });
    }

    const targetExists = employeesDatabase.some(emp => emp.id === id);
    if (!targetExists) {
      return NextResponse.json({ error: "Resource already wiped or missing" }, { status: 404 });
    }

    // Filter target completely out of database instance
    employeesDatabase = employeesDatabase.filter(emp => emp.id !== id);

    return NextResponse.json({ message: "Record successfully purged from architecture" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Destruction pipeline error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";

// --- STRICT TYPE CONFIGURATION ---
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Agent" | "Collaborator";
  status: "Active" | "Invited";
  teamName: string;
  initial: string;
  color: string;
}

// इन-मेमोरी ग्लोबल टीम डेटाबेस (मंडे.कॉम डमी मैट्रिक्स)
let globalMembers: TeamMember[] = [
  { id: 1, name: "Aman Sharma", email: "aman@workflow.ai", role: "Admin", status: "Active", teamName: "Dev Team", initial: "AS", color: "bg-indigo-500" },
  { id: 2, name: "Rahul Verma", email: "rahul@workflow.ai", role: "Collaborator", status: "Active", teamName: "Design Team", initial: "RV", color: "bg-emerald-500" },
  { id: 3, name: "Priya Patel", email: "priya@workflow.ai", role: "Agent", status: "Active", teamName: "Dev Team", initial: "PP", color: "bg-pink-500" },
  { id: 4, name: "Rohan Das", email: "rohan@workflow.ai", role: "Agent", status: "Invited", teamName: "Management", initial: "RD", color: "bg-amber-500" },
];

// --- 1. GET: FETCH ALL MEMBERS ---
export async function GET() {
  try {
    // क्रेडेंशियल्स की कैशिंग रोकने के लिए फ्रेश रिस्पॉन्स हेडर सेट करें
    return NextResponse.json(globalMembers, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("🚨 API GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch workspace members" }, { status: 500 });
  }
}

// --- 2. POST: INVITE / CREATE MEMBER ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, teamName, initial, color } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are mandatory fields" }, { status: 400 });
    }

    // डुप्लिकेट ईमेल वैलिडेशन (प्रिवेंट ओवरलैप)
    const emailExists = globalMembers.some(m => m.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return NextResponse.json({ error: "User with this corporate email already exists" }, { status: 400 });
    }

    const newMember: TeamMember = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || "Agent",
      status: "Invited", 
      teamName: teamName || "Dev Team",
      initial: initial || "U",
      color: color || "bg-blue-500"
    };

    globalMembers.push(newMember);
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("🚨 API POST Error:", error);
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
}

// --- 3. PUT: UPDATE ROLE OR STATUS LIVE ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, role, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    // चेक करें कि मेंबर एग्ज़िस्ट करता है या नहीं
    const memberIdNum = Number(id);
    const memberExists = globalMembers.some(m => m.id === memberIdNum);
    if (!memberExists) {
      return NextResponse.json({ error: "Target member not found in directory" }, { status: 404 });
    }

    // डेटाबेस म्यूटेशन अपडेट
    globalMembers = globalMembers.map(m => {
      if (m.id === memberIdNum) {
        return {
          ...m,
          ...(role !== undefined && { role }),
          ...(status !== undefined && { status }),
        };
      }
      return m;
    });

    const updatedMember = globalMembers.find(m => m.id === memberIdNum);
    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error) {
    console.error("🚨 API PUT Error:", error);
    return NextResponse.json({ error: "Failed to update member credentials" }, { status: 500 });
  }
}

// --- 4. DELETE: PURGE / REMOVE MEMBER ---
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Member ID parameter is required" }, { status: 400 });
    }

    const memberIdNum = Number(id);
    const initialLength = globalMembers.length;
    
    // फ़िल्टर आउट करें
    globalMembers = globalMembers.filter(m => m.id !== memberIdNum);

    if (globalMembers.length === initialLength) {
      return NextResponse.json({ error: "Member not found, could not delete" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Member successfully purged from workspace" }, { status: 200 });
  } catch (error) {
    console.error("🚨 API DELETE Error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
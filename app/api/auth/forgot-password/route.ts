import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import User from "@/models/User";
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Please enter your email" }, { status: 400 });
    }
    const UserCollection = await getCollection("User", User);
    const user = await UserCollection.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists, but here we can return a friendly mock message
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }
    // Generate a mock token
    const mockToken = "reset_" + Math.random().toString(36).substr(2, 9);
    
    // We would send email in production. For this refactor, we return a mock success
    return NextResponse.json({
      success: true,
      message: "Password reset link sent! (Mock link: /reset-password?token=" + mockToken + "&email=" + encodeURIComponent(email) + ")",
      token: mockToken
    });
  } catch (error: any) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
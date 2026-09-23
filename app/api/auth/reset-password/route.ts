import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
export async function POST(request: Request) {
    try {
        const { email, password, token } = await request.json();
        if (!email || !password || !token) {
            return NextResponse.json({ error: "Please enter all required fields" }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }
        const UserCollection = await getCollection("User", User);
        const user = await UserCollection.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "Invalid email request" }, { status: 404 });
        }
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Update password in database
        await UserCollection.findByIdAndUpdate(user.id || user._id, { password: hashedPassword });
        return NextResponse.json({ success: true, message: "Password updated successfully!" });
    } catch (error: any) {
        console.error("Reset Password API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
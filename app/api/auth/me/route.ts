import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCollection } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false, error: "Not authenticated" }, { status: 401 });
        }

        // Verify token
        try {
            const decoded: any = jwt.verify(token, JWT_SECRET);

            const UserCollection = await getCollection("User", User);
            
            // 🔥 FIX 1: Custom string ID check karne ke liye "_id" ka use karein
            const rawUser = await UserCollection.findOne({ 
                $or: [
                    { _id: decoded.userId },
                    { id: decoded.userId }
                ]
            });

            if (!rawUser) {
                return NextResponse.json({ authenticated: false, error: "User not found" }, { status: 401 });
            }

            // 🔥 FIX 2: Mongoose document ko plain JSON object mein convert karein pehle
            const userObj = rawUser.toObject ? rawUser.toObject() : rawUser;

            // Password aur backend internal properties ko exclude karke premium client state wrapper banana
            const safeUser = {
                id: userObj._id || userObj.id,
                name: userObj.name,
                email: userObj.email,
                role: userObj.role,
                avatar: userObj.avatar || "",
                color: userObj.color || "bg-indigo-500"
            };

            return NextResponse.json({ authenticated: true, user: safeUser });
        } catch (jwtErr) {
            // Clear invalid cookie
            const nextCookies = await cookies();
            nextCookies.delete("session");
            return NextResponse.json({ authenticated: false, error: "Token expired or invalid" }, { status: 401 });
        }
    } catch (error: any) {
        console.error("Auth Me API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCollection } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Please enter email and password" }, { status: 400 });
        }

        const UserCollection = await getCollection("User", User);
        const rawUser = await UserCollection.findOne({ email });

        if (!rawUser) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const user = rawUser.toObject ? rawUser.toObject() : rawUser;

        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (e) {
            isMatch = false;
        }

        if (!isMatch) {
            isMatch = password === user.password;
        }

        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const userId = user._id || user.id;

        const token = jwt.sign(
            { userId, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const cookieStore = await cookies();
        cookieStore.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: "lax",
        });

        return NextResponse.json({ 
            success: true, 
            user: { id: userId, name: user.name, email: user.email, role: user.role, avatar: user.avatar || "", color: user.color || "bg-indigo-500" } 
        });

    } catch (error: any) {
        console.error("Login API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
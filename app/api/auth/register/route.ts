import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCollection } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";
export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Please enter all required fields" }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }
        const UserCollection = await getCollection("User", User);

        // Check if user already exists
        const existingUser = await UserCollection.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create user
        const newUser = await UserCollection.create({
            name,
            email,
            password: hashedPassword,
            role: "Agent", // Default role
            avatar: name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
            color: "bg-indigo-500"
        });
        // Create JWT token
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        // Save token in cookie
        const cookieStore = await cookies();
        cookieStore.set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: "lax",
        });
        const { password: _, ...safeUser } = newUser;
        return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
    } catch (error: any) {
        console.error("Register API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import bcrypt from 'bcryptjs';
import { signSessionToken } from '@/lib/session';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { phoneNumber, password } = await req.json();

    // Basic validation to ensure request body has data
    if (!phoneNumber || !password) {
        return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }

    // 1. Find user by Phone
    const user = await VeteranProfile.findOne({ phoneNumber });
    
    // FIX 2: Check if user exists AND if they have a password hash
    // This satisfies TypeScript that user.password is not undefined later
    if (!user || !user.password) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // 2. Compare Password with Hash
    // TypeScript now knows user.password is a string because of the check above
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // 3. Generate Session Token (JWT)
    const token = signSessionToken(String(user._id), user.rank);

    const response = NextResponse.json({
      success: true,
      user: {
        userId: user._id,
        fullName: user.fullName,
        rank: user.rank,
        arm: user.arm,
        branch: user.branch,     
        unitName: user.unitName,
        isInterviewComplete: Boolean(user.isInterviewComplete),
      }
    });

    response.cookies.set({
      name: 'veteran_token',
      value: token,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// FIX 1: Ensure JWT_SECRET is treated as a string, not undefined
const JWT_SECRET = process.env.JWT_SECRET;

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

    // FIX 3: runtime check for Secret
    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined in .env file");
        return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    // 3. Generate Session Token (JWT)
    const token = jwt.sign(
      { userId: user._id, rank: user.rank }, 
      JWT_SECRET, // Validated above as string
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        userId: user._id,
        fullName: user.fullName,
        rank: user.rank,
        arm: user.arm,
        branch: user.branch,     
        unitName: user.unitName  
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
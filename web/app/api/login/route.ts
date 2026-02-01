import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // <--- Import JWT

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { phoneNumber, password } = await req.json();

    // 1. Find user by Phone
    const user = await VeteranProfile.findOne({ phoneNumber });
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // 2. SECURITY FIX: Compare Password with Hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // 3. SECURITY FIX: Generate Session Token (JWT)
    // This creates a secure token containing the User ID
    const token = jwt.sign(
      { userId: user._id, rank: user.rank }, 
      JWT_SECRET, 
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
        
        // ✅ NEW FIELDS ADDED HERE
        branch: user.branch,     
        unitName: user.unitName  
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
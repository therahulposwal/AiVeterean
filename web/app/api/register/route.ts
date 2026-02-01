import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    // ✅ Extract new fields
    const { fullName, phoneNumber, password, branch, rank, arm, unitName } = await req.json();

    await dbConnect();

    const existingUser = await VeteranProfile.findOne({ phoneNumber });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Phone number already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await VeteranProfile.create({
      fullName,
      phoneNumber,
      password: hashedPassword,
      branch,    // ✅ Saved
      rank,
      arm,
      unitName,  // ✅ Saved
      
      isInterviewComplete: false,
      interviewNotes: [],
      profileData: {}
    });

    return NextResponse.json({ 
      success: true, 
      userId: user._id,
      rank: user.rank,
      arm: user.arm 
    });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
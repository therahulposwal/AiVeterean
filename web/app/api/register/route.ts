import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import bcrypt from 'bcryptjs';

interface RegisterBody {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  branch: string;
  rank: string;
  arm: string;
  unitName: string;
}

export async function POST(req: Request) {
  try {
    const { fullName, email, phoneNumber, password, branch, rank, arm, unitName } = (await req.json()) as RegisterBody;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    // 1. Check Phone
    const existingPhone = await VeteranProfile.findOne({ phoneNumber });
    if (existingPhone) {
      return NextResponse.json({ success: false, error: "Phone number already registered" }, { status: 400 });
    }

    // 2. Check Email
    const existingEmail = await VeteranProfile.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userPayload: {
      fullName: string;
      email: string;
      phoneNumber: string;
      password: string;
      branch: string;
      rank: string;
      arm: string;
      unitName: string;
      isInterviewComplete: boolean;
      interviewNotes: string[];
      profileData: Record<string, never>;
    } = {
      fullName,
      email: normalizedEmail,
      phoneNumber,
      password: hashedPassword,
      branch,
      rank,
      arm,
      unitName,
      
      // Defaults
      isInterviewComplete: false,
      interviewNotes: [],
      profileData: {}
    };

    const user = await VeteranProfile.create(userPayload);

    return NextResponse.json({ 
      success: true, 
      userId: user._id,
      rank: user.rank,
      arm: user.arm 
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    console.error("Registration Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

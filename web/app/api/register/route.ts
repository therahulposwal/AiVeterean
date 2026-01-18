import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VeteranProfile from '@/models/VeteranProfile';
import bcrypt from 'bcryptjs'; // <--- Import bcrypt

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { fullName, phoneNumber, password, rank, arm } = body;

    const existingUser = await VeteranProfile.findOne({ phoneNumber });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User already exists.' }, { status: 400 });
    }

    // --- SECURITY FIX: HASHING ---
    // Generate a "salt" (random data) and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await VeteranProfile.create({
      fullName,
      phoneNumber,
      password: hashedPassword, // <--- Save the HASH, not the real password
      rank,
      arm
    });

    return NextResponse.json({ success: true, userId: user._id, rank: user.rank, arm: user.arm });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}
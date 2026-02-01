import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID Missing" }, { status: 400 });
    }

    await dbConnect();
    const profile = await VeteranProfile.findById(userId);

    if (!profile) {
      return NextResponse.json({ success: false, message: "Profile Not Found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: profile 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
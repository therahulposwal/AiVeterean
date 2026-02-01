// web/app/api/reset-interview/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    console.log("🔍 --- DEBUG: RESET API STARTED ---");

    // 1. Check Secret
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("❌ ERROR: JWT_SECRET is missing in web/.env.local");
      return NextResponse.json({ success: false, error: 'Server Config Error: Missing Secret' }, { status: 500 });
    }
    console.log("✅ Secret Loaded (Length):", secret.length);

    // 2. Check Token Format
    const authHeader = req.headers.get('authorization');
    console.log("recd header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("❌ ERROR: Missing or Malformed Auth Header");
      return NextResponse.json({ success: false, error: 'Unauthorized: No Token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    console.log("✅ Token Extracted:", token.substring(0, 10) + "...");

    // 3. Verify Token
    let userId;
    try {
      // @ts-ignore
      const decoded = jwt.verify(token, secret);
      // @ts-ignore
      userId = decoded.userId;
      console.log("✅ Token Verified. User ID:", userId);
    } catch (err: any) {
      console.error("❌ ERROR: Verification Failed:", err.message);
      // This prints WHY it failed (e.g., "invalid signature" vs "jwt expired")
      return NextResponse.json({ success: false, error: `Invalid Token: ${err.message}` }, { status: 401 });
    }

    // 4. Connect & Update DB
    await dbConnect();
    await VeteranProfile.findByIdAndUpdate(userId, {
        $set: { 
            interviewNotes: [], 
            isInterviewComplete: false, 
            profileData: {} 
        },
        $unset: { 
            lastSessionHandle: "", 
            lastSessionTs: "" 
        }
    });

    console.log("✅ DB Update Successful");
    return NextResponse.json({ success: true, message: 'Profile reset successfully' });

  } catch (error: any) {
    console.error('❌ SERVER ERROR:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
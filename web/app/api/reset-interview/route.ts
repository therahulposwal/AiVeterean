import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth';
import { EMPTY_PROFILE_DATA } from '@/types/profile';

export async function POST(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    await VeteranProfile.findByIdAndUpdate(userId, {
      $set: {
        interviewNotes: [],
        isInterviewComplete: false,
        interviewPhase: 'FOUNDATION',
        appointmentCount: 0,
        profileData: EMPTY_PROFILE_DATA,
      },
      $unset: {
        lastSessionHandle: '',
        lastSessionTs: '',
      },
    });

    return NextResponse.json({ success: true, message: 'Profile reset successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

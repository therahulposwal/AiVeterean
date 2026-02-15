import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth';
import { type VeteranProfilePayload } from '@/types/profile';

interface UpdateProfileBody {
  data: VeteranProfilePayload;
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as UpdateProfileBody;
    if (!body?.data) {
      return NextResponse.json({ success: false, error: 'Missing profile payload' }, { status: 400 });
    }

    await dbConnect();
    const legacyLinkedProfile = (body.data as VeteranProfilePayload & { linkedProfile?: string }).linkedProfile;
    const linkedin = (body.data.linkedin ?? legacyLinkedProfile)?.trim();
    const updatedProfile = await VeteranProfile.findByIdAndUpdate(
      userId,
      {
        $set: {
        fullName: body.data.fullName,
        email: body.data.email,
        phoneNumber: body.data.phoneNumber,
        linkedin,
        rank: body.data.rank,
        arm: body.data.arm,
        branch: body.data.branch,
        unitName: body.data.unitName,
        profileData: body.data.profileData,
        },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

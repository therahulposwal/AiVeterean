import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth';
import { signRelayToken } from '@/lib/session';

export async function GET(request: NextRequest) {
  const userId = getAuthenticatedUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const relayToken = signRelayToken(userId);
  return NextResponse.json({ success: true, relayToken });
}

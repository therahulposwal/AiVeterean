import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAuthenticatedUserIdFromRequest } from '@/lib/auth';

// Using Gemini 1.5 Flash or 2.0 Flash for speed and accuracy
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

type BuildProfileBody = {
  userId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserIdFromRequest(req);
    let userIdFromBody: string | null = null;

    // Body is optional for this route (client currently sends an empty POST).
    const rawBody = await req.text();
    if (rawBody.trim().length > 0) {
      let parsedBody: BuildProfileBody;
      try {
        parsedBody = JSON.parse(rawBody) as BuildProfileBody;
      } catch {
        return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
      }
      userIdFromBody = typeof parsedBody.userId === 'string' ? parsedBody.userId : null;
    }

    const userId = authenticatedUserId ?? userIdFromBody;

    console.log("------------------------------------------------");
    console.log("🕵️  PROFILE ARCHITECT: STARTING JOB");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const profile = await VeteranProfile.findById(userId);

    if (!profile) {
      return NextResponse.json({ success: false, message: "Profile Not Found" }, { status: 404 });
    }

    const rawData = profile.interviewNotes?.join("\n") || "";
    
    if (!rawData) {
      return NextResponse.json({ success: false, message: "No notes found" }, { status: 400 });
    }

    // ✅ PROMPT UPDATED: Added Professional Summary & Data Restrictions
    const prompt = `
      You are an expert Military-to-Civilian Resume Architect.
      
      CANDIDATE PROFILE:
      - Service Branch: ${profile.branch}
      - Rank: ${profile.rank}
      - Arm/Trade: ${profile.arm}
      - Last Unit/Base: ${profile.unitName}
      
      SOURCE DATA (Raw Interview Notes):
      ---
      ${rawData}
      ---
      
      TASK:
      1. Write a 3-4 sentence "professionalSummary" translating military leadership into corporate value.
      2. Extract "workExperience", "technicalSkills", "softSkills", "courses", and "achievements".
      3. Use ONLY explicitly mentioned facts. Do not fabricate.
      4. Do NOT extract education/degrees (User will provide these manually).
      
      OUTPUT FORMAT (Strict JSON):
      {
        "professionalSummary": "High-impact summary string...",
        "workExperience": [
          {
            "role": "Job Title",
            "unit": "Unit Name",
            "location": "City/Region",
            "startDate": "Year",
            "endDate": "Year",
            "responsibilities": ["Action verb bullet 1", "Action verb bullet 2"]
          }
        ],
        "technicalSkills": [],
        "softSkills": [],
        "courses": [],
        "achievements": []
      }

      Return raw JSON only. No markdown formatting.
    `;

    console.log("🤖  Generating AI Content...");
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Sanitize
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let structuredData;
    try {
      structuredData = JSON.parse(text);
    } catch {
      console.error("🔥 JSON Parse Error:", text);
      return NextResponse.json({ success: false, message: "Invalid AI Output" }, { status: 500 });
    }

    // ✅ DATA MERGE STRATEGY
    // We keep 'education' if it exists in profileData, but overwrite other fields with fresh AI data.
    profile.profileData = {
        ...(profile.profileData || {}), // Keep manual data (like education)
        ...structuredData              // Overwrite with AI data (summary, work, skills)
    };

    profile.isInterviewComplete = true;
    
    // Explicitly set the timestamp to trigger the 'key' refresh in the frontend
    profile.markModified('profileData'); 
    await profile.save();
    
    console.log("🎉  PROFILE BUILT & SAVED");
    console.log("------------------------------------------------");

    return NextResponse.json({ 
      success: true, 
      data: structuredData 
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    console.error("🔥 FATAL ERROR:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

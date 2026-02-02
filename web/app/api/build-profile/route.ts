import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VeteranProfile from '@/models/VeteranProfile';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Using the fast & stable model for text generation
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    console.log("------------------------------------------------");
    console.log("🕵️  PROFILE ARCHITECT: STARTING JOB");
    console.log(`🔎  Looking for _id: "${userId}"`);

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID Missing" }, { status: 400 });
    }

    await dbConnect();
    const profile = await VeteranProfile.findById(userId);

    if (!profile) {
      console.error("❌  Profile NOT FOUND in DB");
      return NextResponse.json({ success: false, message: "Profile Not Found" }, { status: 404 });
    }

    const noteCount = profile.interviewNotes?.length || 0;
    console.log(`✅  Profile Found. Notes Available: ${noteCount}`);

    if (noteCount === 0) {
      console.warn("⚠️  Interview Notes are Empty");
      return NextResponse.json({ 
        success: false, 
        message: "No interview notes found. Please speak to the AI first." 
      }, { status: 404 });
    }

    // 2. Prepare Data
    console.log("📝  Compiling Transcript...");
    const rawData = profile.interviewNotes.join("\n");
    
    // ✅ INJECT NEW FIELDS INTO PROMPT
    const prompt = `
      You are an expert Military-to-Civilian Resume Architect.
      
      CANDIDATE PROFILE:
      - Service Branch: ${profile.branch}      // ✅ NEW
      - Rank: ${profile.rank}
      - Arm/Trade: ${profile.arm}
      - Last Unit/Base: ${profile.unitName}    // ✅ NEW
      
      SOURCE DATA (Raw Interview Notes):
      ---
      ${rawData}
      ---
      
      TASK:
      Analyze the raw notes and extract a structured professional profile.
      Use only the information explicitly present in the notes.
      Do not infer, assume, or fabricate any facts.
      Preserve original intent, hierarchy, and factual accuracy.
      If any required detail is missing, leave the field blank or mark it as "Not Provided".
      
      OUTPUT FORMAT (Strict JSON):
      You must return a JSON object matching this exact schema:
      {
        "workExperience": [
          {
            "role": "Job Title (e.g. Platoon Commander)",
            "unit": "Unit Name (e.g. 15 Rashtriya Rifles)",
            "location": "City/Region (e.g. J&K)",
            "startDate": "Year (e.g. 2015)",
            "endDate": "Year (e.g. 2018)",
            "responsibilities": ["Action verb bullet point 1", "Action verb bullet point 2"]
          }
        ],
        "technicalSkills": ["Skill 1", "Skill 2"],
        "softSkills": ["Leadership", "Discipline"],
        "courses": ["Course Name 1", "Course Name 2"],
        "achievements": ["Award or Achievement 1"]
      }

      Do NOT wrap the output in markdown code blocks. Return raw JSON only.
    `;

    // 3. Generate Content
    console.log("🤖  Calling Gemini 3 Flash...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // 4. Sanitize
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 5. Parse & Save
    let structuredData;
    try {
      structuredData = JSON.parse(text);
      console.log("✨  JSON Parsed Successfully");
    } catch (e) {
      console.error("🔥  JSON Parse Error. Raw Output:", text);
      return NextResponse.json({ success: false, message: "AI Generation Failed (Invalid JSON)" }, { status: 500 });
    }

    profile.profileData = structuredData;
    profile.isInterviewComplete = true; // Mark as done
    
    await profile.save();
    
    console.log("💾  Saved Structured Data to MongoDB");
    console.log("🎉  JOB COMPLETE");
    console.log("------------------------------------------------");

    return NextResponse.json({ 
      success: true, 
      data: structuredData 
    });

  } catch (error: any) {
    console.error("🔥  FATAL ERROR:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
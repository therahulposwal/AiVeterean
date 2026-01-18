import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VeteranProfile from '@/models/VeteranProfile';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Standard Gemini (Not Live)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId } = await req.json();

    // 1. Get the Raw Notes
    const user = await VeteranProfile.findById(userId);
    if (!user || !user.interviewNotes || user.interviewNotes.length === 0) {
      return NextResponse.json({ success: false, message: "No notes found to process." });
    }

    const notes = user.interviewNotes.join("\n");
    console.log("🏗️ Architecting Profile from notes:", notes);

    // 2. Ask Gemini 1.5 Pro to Build the Profile
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
      You are a Military Data Analyst.
      Your goal is to build a structured "Veteran Profile" from raw interview notes.
      
      RAW NOTES:
      ---
      ${notes}
      ---
      
      INSTRUCTIONS:
      1. Analyze the notes to reconstruct the veteran's career timeline.
      2. Group scattered facts into specific "Work Experience" entries.
      3. Extract specific technical skills and soft skills.
      4. Infer dates or durations if context is available (e.g., "served there for 2 years").

      OUTPUT FORMAT (Strict JSON):
      {
        "workExperience": [
          { 
            "role": "string (e.g. Transport Supervisor)", 
            "unit": "string (e.g. 510 ASC Bn)", 
            "location": "string", 
            "startDate": "string (YYYY)", 
            "endDate": "string (YYYY)",
            "responsibilities": ["string", "string"] 
          }
        ],
        "technicalSkills": ["string"],
        "softSkills": ["string"],
        "courses": ["string"],
        "achievements": ["string"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean JSON
    const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const profileData = JSON.parse(jsonString);

    // 3. Save Structured Profile to DB
    await VeteranProfile.findByIdAndUpdate(userId, {
      profileData: profileData
    });

    return NextResponse.json({ success: true, data: profileData });

  } catch (error) {
    console.error("Profile Build Error:", error);
    return NextResponse.json({ success: false, error: 'Processing failed' }, { status: 500 });
  }
}
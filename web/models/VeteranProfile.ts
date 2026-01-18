import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define the Interface (for TypeScript safety)
export interface IVeteranProfile extends Document {
  userId?: string;
  phoneNumber: string;
  password?: string;
  fullName?: string;
  rank?: string;
  arm?: string;
  
  // New Fields for Profile Builder
  interviewNotes: string[];
  profileData?: {
    workExperience: Array<{
      role: string;
      unit: string;
      location: string;
      startDate: string;
      endDate: string;
      responsibilities: string[];
    }>;
    technicalSkills: string[];
    softSkills: string[];
    courses: string[];
    achievements: string[];
  };
  
  createdAt: Date;
}

// 2. Define the Schema (Must match Relay Server exactly)
const VeteranProfileSchema = new Schema<IVeteranProfile>({
  userId: { type: String, index: true }, 
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  fullName: String,
  rank: String,
  arm: String,

  // --- RAW INPUT (The "Notebook") ---
  interviewNotes: { type: [String], default: [] }, 

  // --- STRUCTURED PROFILE (The "Database") ---
  profileData: {
    workExperience: [{
      role: String,
      unit: String,
      location: String,
      startDate: String,
      endDate: String,
      responsibilities: [String]
    }],
    technicalSkills: [String],
    softSkills: [String],
    courses: [String],
    achievements: [String]
  },
  
  createdAt: { type: Date, default: Date.now }
});

// 3. Export Model (with Next.js Hot-Reload fix)
const VeteranProfile: Model<IVeteranProfile> = mongoose.models.VeteranProfile || mongoose.model<IVeteranProfile>('VeteranProfile', VeteranProfileSchema);

export default VeteranProfile;
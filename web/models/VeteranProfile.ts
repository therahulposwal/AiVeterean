import mongoose, { Schema, Document, Model } from 'mongoose';
import { type ProfileData } from '@/types/profile';

// 1. Define Interface
export interface IVeteranProfile extends Document {
  phoneNumber?: string;
  email?: string; // ✅ Added to Interface
  linkedin?: string;
  password?: string;
  fullName?: string;
  rank?: string;
  arm?: string;
  branch?: string;
  unitName?: string;
  
  // State Machine Tracking
  interviewPhase: string;
  appointmentCount: number;
  
  // Data Buckets
  interviewNotes: string[];
  isInterviewComplete: boolean;
  
  // Session Persistence
  lastSessionHandle?: string;
  lastSessionTs?: Date;

  // Generated Profile JSON
  profileData?: ProfileData;
  education?: {
      degree: string;
      institution: string;
      year: string;
      marks: string; // ✅ Added Marks/Grade
    }[]; 
  
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define Schema
const VeteranProfileSchema: Schema<IVeteranProfile> = new mongoose.Schema({
  phoneNumber: { type: String, unique: true, sparse: true }, 
  
  // ✅ ADDED EMAIL FIELD
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  linkedin: { type: String, trim: true },

  password: { type: String }, 
  fullName: { type: String },
  rank: { type: String },
  arm: { type: String },
  branch: { type: String },
  unitName: { type: String },
  
  // State Machine Defaults
  interviewPhase: { type: String, default: 'FOUNDATION' }, 
  appointmentCount: { type: Number, default: 0 }, 

  interviewNotes: { type: [String], default: [] },
  
  isInterviewComplete: { type: Boolean, default: false },
  
  lastSessionHandle: { type: String },
  lastSessionTs: { type: Date },

  profileData: { type: Object, default: {} } 
}, { 
  timestamps: true 
});

// 3. Export Model
const existingModel = mongoose.models.VeteranProfile as Model<IVeteranProfile> | undefined;

// Hot-reload safety: if an older cached model exists without new paths, patch it in-place.
if (existingModel && !existingModel.schema.path('linkedin')) {
  existingModel.schema.add({ linkedin: { type: String, trim: true } });
}

const VeteranProfile: Model<IVeteranProfile> =
  existingModel ||
  mongoose.model<IVeteranProfile>('VeteranProfile', VeteranProfileSchema);

export default VeteranProfile;

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVeteranProfile extends Document {
  phoneNumber: string;
  password?: string;
  fullName?: string;
  branch: string; // Army, Navy, Air Force
  rank: string;
  arm: string;    // Arm/Trade/Department
  unitName: string; // Regiment / Squadron / Ship
  isInterviewComplete: boolean; // ✅ Added to Interface
  interviewNotes: string[];
  lastSessionHandle?: string;
  lastSessionTs?: Date;
  profileData: any;
  createdAt: Date;
}

const VeteranProfileSchema: Schema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  branch: { type: String, required: true, default: 'Army' },
  rank: { type: String, required: true },
  arm: { type: String, required: true },
  unitName: { type: String, required: true }, // "9th Rajput", "INS Vikrant"
  
  // ✅ Added to Schema
  isInterviewComplete: { type: Boolean, default: false },

  interviewNotes: [String], 
  lastSessionHandle: { type: String },
  lastSessionTs: { type: Date },
  profileData: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const VeteranProfile: Model<IVeteranProfile> = 
  mongoose.models.VeteranProfile || 
  mongoose.model<IVeteranProfile>('VeteranProfile', VeteranProfileSchema);

export default VeteranProfile;
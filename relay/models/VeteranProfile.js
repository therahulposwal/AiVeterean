const mongoose = require('mongoose');

const VeteranProfileSchema = new mongoose.Schema({
  phoneNumber: { type: String, unique: true, sparse: true }, 
  
  // ✅ ADDED EMAIL (Unique + Sparse allows it to be optional but unique if present)
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  linkedin: { type: String, trim: true },
  
  password: { type: String }, // Hashed
  fullName: String,
  rank: String,
  arm: String,
  branch: String,
  unitName: String,
  
  // State Machine Tracking
  interviewPhase: { type: String, default: 'FOUNDATION' }, 
  appointmentCount: { type: Number, default: 0 }, // Critical for loops

  // Data Buckets
  interviewNotes: [String],
  
  isInterviewComplete: { type: Boolean, default: false },
  
  // Session Persistence
  lastSessionHandle: String,
  lastSessionTs: Date,

  // Generated Profile JSON
  profileData: { type: Object }
   
}, { timestamps: true });

const existingModel = mongoose.models.VeteranProfile;

// Hot-reload safety: patch cached schema if it was created before linkedin existed.
if (existingModel && !existingModel.schema.path('linkedin')) {
  existingModel.schema.add({ linkedin: { type: String, trim: true } });
}

module.exports = existingModel || mongoose.model('VeteranProfile', VeteranProfileSchema);

// relay/models/VeteranProfile.js
const mongoose = require('mongoose');

const VeteranProfileSchema = new mongoose.Schema({
  userId: { type: String, index: true }, 
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  rank: String,
  arm: String,

  // --- 1. RAW INPUT (The "Notebook") ---
  // The AI dumps raw facts here during the call
  interviewNotes: [String], 

  // --- 2. STRUCTURED PROFILE (The "Database") ---
  // Generated after the call by the Profile Architect
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

module.exports = mongoose.model('VeteranProfile', VeteranProfileSchema);
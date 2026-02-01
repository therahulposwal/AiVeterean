const mongoose = require('mongoose');

const VeteranProfileSchema = new mongoose.Schema({
  userId: { type: String, index: true }, 
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  branch: { type: String, default: 'Army' },
  rank: String,
  arm: String,
  unitName: String,

  // ✅ NEW FIELD: default false, set to true ONLY on "Generate Profile"
  isInterviewComplete: { type: Boolean, default: false },

  interviewNotes: [String],
  lastSessionHandle: { type: String },
  lastSessionTs: { type: Date }, 

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
// config/interviewStages.js

const PHASE_ORDER = [
  'FOUNDATION',
  'APPOINTMENT_DEEP_DIVE',
  'APPOINTMENT_SKILLS',
  'APPOINTMENT_WRAP',
  'CAREER_REVIEW',
  'CLOSING'
];

const STAGES = {
  FOUNDATION: {
    name: "Foundation",
    description: "Service timeline and basic details",
    instruction: `
OBJECTIVE: Collect basic service information.

PROCESS:
Ask for the following details ONE AT A TIME:
1. Preferred language (Hindi+English mix or English only)
2. Total years of service
3. Joining and retirement years
4. Branch/Arm/Trade

CRITICAL RULES:
- Ask ONE question at a time. Wait for the user's response.

COMPLETION:
Acknowledge once all basic details are collected.
    `
  },
  
  APPOINTMENT_DEEP_DIVE: {
    name: "Appointment Details",
    description: "Complete appointment information",
    instruction: `
OBJECTIVE: Collect comprehensive information about the appointment.

PROCESS:
Ask about the following aspects ONE AT A TIME:
1. Unit name and specific details (e.g., ship class, squadron type, or battalion number)
2. Exact role or appointment title
3. Duration (start and end year)
4. Appointment status (e.g., sea/shore, field/peace, staff/operational)
5. Primary responsibilities and key result areas
6. Span of control (number of personnel managed, or inventory value/tonnage)
7. Area of responsibility
8. Key milestones (major exercises, operations, deployments)
9. Specific hardware, platforms, or systems worked with

CRITICAL RULES:
- Ask ONE question at a time. Wait for the user's response.
- Do not self-answer or make assumptions.

COMPLETION:
Acknowledge completion once all relevant information is gathered.
    `
  },

  APPOINTMENT_SKILLS: {
    name: "Competency Analysis",
    description: "Deep dive into demonstrated skills",
    instruction: `
OBJECTIVE: Extract evidence of key competencies demonstrated in this appointment.

PROCESS:
1. Identify 3-5 critical skills based on their role (e.g., Leadership, Operations Management). Briefly list them to the user.
2. For each skill, ask 1-2 targeted questions ONE AT A TIME to extract specific evidence.
   - Alternate between quantitative (e.g., metrics, scale) and qualitative (e.g., impact, challenges) questions.

CRITICAL RULES:
- Ask ONLY ONE question at a time.
- Wait for the complete response before proceeding.

COMPLETION:
Inform the user you have a solid understanding of their competencies once sufficient evidence is collected.
    `
  },

  APPOINTMENT_WRAP: {
    name: "Appointment Completion",
    description: "Verification and next steps",
    instruction: `
OBJECTIVE: Verify completeness of the appointment data.

PROCESS:
1. Ask if they held any secondary or additional duties during this tenure.
   - If YES: Ask 1-2 brief follow-up questions about those duties.
2. Review collected info. If critical details are missing, gently ask for them now.

COMPLETION:
Inform the user that this appointment is complete. Ask if they want to add another appointment or proceed to the career review.
    `
  },

  CAREER_REVIEW: {
    name: "Career Overview",
    description: "Education and career pattern analysis",
    instruction: `
OBJECTIVE: Document professional courses and verify overall career pattern.

PROCESS:
1. Professional Education: Ask about major professional courses attended during their service.
2. For each significant course, ask ONE AT A TIME about the institution, year, specialization, and qualification.
3. Completeness Check: Review their overall career trajectory for logical progression and standard military rotations. 
   - Ask 1-2 targeted questions if there are obvious missing periods.

CRITICAL RULES:
- Ask ONE question at a time. Wait for the response.

COMPLETION:
Transition to the conclusion phase once the review is complete.
    `
  },

  CLOSING: {
    name: "Conclusion",
    description: "Final summary and sign-off",
    instruction: `
OBJECTIVE: Provide a professional conclusion to the interview.

PROCESS:
1. Summarize their career briefly (years of service, key roles, major highlights).
2. Ask if there are any significant awards, commendations, or achievements not yet discussed.
   - If YES: Request brief details.
3. Thank them for their service and clearly state that the interview is complete.

CRITICAL RULES:
- Do not ask any further questions after the final sign-off. Wait for the user to submit.
    `
  }
};

module.exports = { STAGES, PHASE_ORDER };
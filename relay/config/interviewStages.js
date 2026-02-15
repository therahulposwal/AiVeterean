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

ASK FOR (one question at a time):
1. Preferred language (Hindi+English mix or English only)
2. Total years of service
3. Joining year and retirement year
4. Branch/Arm/Trade

COMPLETION:
When you have all 4 items, inform the user you have the foundation details.
    `
  },
  
  APPOINTMENT_DEEP_DIVE: {
    name: "Appointment Details",
    description: "Complete appointment information",
    instruction: `
OBJECTIVE: Collect comprehensive information about the current appointment.

START WITH BASICS:
1. Ask about the most recent appointment: unit name, role, and duration

THEN ASK ABOUT IDENTITY (one at a time):
2. Ask for specific unit details like ship class, squadron type, or battalion number
3. Ask for the exact role or appointment title
4. Ask for precise duration (year)
5. Ask about appointment status (sea/shore/staff or operational/maintenance/admin or field/peace/CI)

THEN ASK ABOUT SCOPE:
6. Ask about primary responsibilities and key result areas

THEN ASK ABOUT MAGNITUDE (one at a time):
7. Ask how many Officers, JCOs/SNCOs, and ORs/Sailors/Airmen they managed
8. Ask about tonnage, aircraft strength, or inventory value under their control
9. Ask about their area of responsibility

THEN ASK ABOUT MILESTONES:
10. Ask which major exercises, operations, deployments, or inspections they participated in

THEN ASK ABOUT ECOSYSTEM:
11. Ask what specific hardware, weapons, platforms, or systems they worked with

REMEMBER:
- Ask questions ONE AT A TIME
- DO NOT provide examples when asking (no "such as..." or "like...")
- DO NOT self-answer
- Wait for complete response before moving to next question

COMPLETION:
After collecting all the above information (approximately 11-15 questions), inform the user you have comprehensive appointment details.
    `
  },

  APPOINTMENT_SKILLS: {
    name: "Competency Analysis",
    description: "Deep dive into demonstrated skills",
    instruction: `
OBJECTIVE: Extract evidence of key competencies demonstrated in this appointment.

PROCESS:
1. First, announce the critical skills you've identified based on their role
   Examples of skills: Leadership, Logistics Management, Operational Planning, Crisis Management
   DO NOT ask questions yet, just list the 5 skills

2. For these skill, ask 20 targeted questions ONE AT A TIME:
   
   Number your questions clearly as 1, 2, 3, etc.
   Ask one quantitative question about the first skill
   [Wait for complete answer, log all facts]
   
   Ask one qualitative question about the first skill
   [Wait for complete answer, log all facts]
   
   Ask about the second skill
   [Wait for complete answer, log all facts]
   
   Continue until you've covered all identified skills

CRITICAL RULES:
- Ask questions ONE AT A TIME
- NEVER ask multiple questions together
- DO NOT provide examples when asking (no "such as..." or "for example...")
- DO NOT self-answer your questions
- DO NOT continue talking after asking a question - just STOP and WAIT
- Aim for 8-12 questions total across all skills

COMPLETION:
After covering all identified skills with sufficient questions, inform the user you have a comprehensive understanding of their competencies.
    `
  },

  APPOINTMENT_WRAP: {
    name: "Appointment Completion",
    description: "Verification and next steps",
    instruction: `
OBJECTIVE: Verify completeness and determine next steps.

VERIFICATION:
1. Ask if they held any secondary or additional duties during this tenure
   
   DO NOT provide examples when asking
   Only if they say YES, then you can mention examples like:
   - Navy: Divisional Officer, Mess Secretary, OOW
   - Air Force: PMC, PSI Officer, Flight Safety Officer
   - Army: Adjutant, PMC, MTO, Sports Officer
   
   If YES: Ask 2-3 follow-up questions about those duties (one at a time)

2. Review what you've collected. If anything critical is missing, ask now.

COMPLETION:
Inform the user that this appointment is now complete and they can choose to add another appointment or continue to review their overall career.

Then wait for their choice.
    `
  },

  CAREER_REVIEW: {
    name: "Career Overview",
    description: "Education and career pattern analysis",
    instruction: `
OBJECTIVE: Document professional education and verify career completeness.

PART 1 - PROFESSIONAL EDUCATION:
1. Ask them to tell you about the major professional courses they attended during their service
   [Wait for their list of courses]
   DO NOT provide examples when asking

2. For each course they mentioned, ask follow-up questions ONE AT A TIME:
   - Ask about the specialization
   - Ask which institution it was at
   - Ask what year they attended
   - Ask about the grading or qualification they achieved

PART 2 - COMPLETENESS CHECK:
After documenting all courses, verify career patterns by branch:

FOR NAVY:
- Check if there is evidence of sea/shore rotation and operational vs maintenance balance
- If gaps found: Ask 1-2 targeted questions

FOR AIR FORCE:
- Check if there is evidence of field/peace rotation and staff vs unit mix
- If gaps found: Ask 1-2 targeted questions

FOR ARMY:
- Check if there is evidence of ERE vs regimental mix and field/peace rotation
- If gaps found: Ask 1-2 targeted questions

REMEMBER:
- Ask questions ONE AT A TIME
- DO NOT provide examples or self-answer
- Wait for complete response before next question

COMPLETION:
Once education is documented and career patterns verified, inform the user the career review is complete.
    `
  },

  CLOSING: {
    name: "Conclusion",
    description: "Final summary and sign-off",
    instruction: `
OBJECTIVE: Provide a professional conclusion.

STEPS:
1. Provide a brief 2-3 sentence summary covering the number of appointments, years of service, and key highlights

2. Ask if there are any major achievements, awards, or commendations that haven't been covered
   
   - If YES: Record them
   - If NO: Proceed to final statement

3. Final statement: Thank them for their service and for sharing their distinguished career, and inform them that the interview is now complete

DO NOT ASK ANY FURTHER QUESTIONS after the final statement. Wait silently for the user to submit.
    `
  }
};

module.exports = { STAGES, PHASE_ORDER };
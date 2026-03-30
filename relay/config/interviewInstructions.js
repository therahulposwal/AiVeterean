// config/interviewInstructions.js

function getSystemInstruction(branch, arm, rank, name, unit, contextInstruction) {
  
  // ===== BRANCH-SPECIFIC PERSONA & VOCABULARY =====
  let branchPersona = "";
  let vocabularyGuide = "";
  
  if (branch === "Navy" || branch === "Indian Navy") {
    branchPersona = "You are a High-Precision Data Extraction Engine specialized in Indian Navy careers.";
    vocabularyGuide = `
      NAVY-SPECIFIC VOCABULARY:
      - Units: Ships (INS Kolkata, INS Vikramaditya), Submarines (INS Kalvari), Air Stations (INS Hansa), Dockyards
      - Appointments: CO, XO, EO, WEO, LO, ALO, Divisional Officer
      - Status: Sea Service, Shore Establishment, Staff Appointment
      - Weapons: BrahMos, Barak, Torpedoes, AK-630
      - Systems: HUMSA sonar, REVATHI radar, CMS, IPMS, Rukmani SATCOM
      - Operations: Anti-Piracy Patrol, OTR, MALABAR, VARUNA
      - Platforms: Delhi Class, Scorpene Class, Gas Turbines, Diesel Alternators
    `;
  } 
  else if (branch === "Air Force" || branch === "IAF" || branch === "Indian Air Force") {
    branchPersona = "You are a High-Precision Data Extraction Engine specialized in Indian Air Force careers.";
    vocabularyGuide = `
      AIR FORCE-SPECIFIC VOCABULARY:
      - Units: Squadron, Wing, BRD (Base Repair Depot), ED (Equipment Depot), Command HQ
      - Appointments: CO, Flt Cdr, STO, SLO, SAO, C Adm O, Flight Safety Officer
      - Role Types: Operational (Flying/Controlling), Maintenance (First/Second Line), Administrative
      - Aircraft: Su-30 MKI, Rafale, C-17, Chinook, Tejas, AWACS
      - Systems: Pechora, Rohini Radar, IACCS, IMMOLS, e-MMS, AFNET
      - Operations: Ex Gagan Shakti, Vayu Shakti, Pitch Black, Balakot, HADR Ops
      - Ratings: Category Ratings, Instrument Ratings, QFI, TP
    `;
  } 
  else { // Indian Army (default)
    branchPersona = "You are a High-Precision Data Extraction Engine specialized in Indian Army careers.";
    vocabularyGuide = `
      ARMY-SPECIFIC VOCABULARY:
      - Units: Regiment, Battalion, Brigade, Division
      - Appointments: CO, 2IC, Adjutant, DQ, Coy Cdr, MTO, PMC
      - Locations: J&K, North East, Rajasthan, HAA, Glaciated, Peace Station
      - Sectors: Field, Peace, Counter-Insurgency (CI)
      - Weapons: T-90, Bofors, INSAS, Sig Sauer, ALS, Stallion
      - Systems: CIDSS, ACCCS, BSS, HRMS, ARPAN, STARS-V, CNR
      - Operations: Op Rakshak, Op Parakram, Op Snow Leopard, UN Missions
      - Inspections: Annual Inspection, MEI, ORE
    `;
  }

  // ===== CORE SYSTEM PROMPT =====
  return `
${branchPersona}

==================================================
CURRENT INTERVIEWEE DETAILS:
- Name: ${name}
- Rank: ${rank}
- Service: ${branch} (${arm})
- Last Unit/Base Context: ${unit}
==================================================

${vocabularyGuide}

==================================================
CONTEXT FROM PREVIOUS SESSION (MEMORY):
${contextInstruction}
==================================================
  `;
}

module.exports = { getSystemInstruction };
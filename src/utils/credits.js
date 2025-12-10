// src/utils/credits.js

// Special CS courses that are NOT 3 credits.
const SPECIAL_CS_CREDITS = {
    "COMP SCI 220": 4,
    "COMP SCI 304": 1,
    "COMP SCI 320": 4,
    "COMP SCI / LIS / STAT 401": 1,
    "COMP SCI 402": 2,
    "COMP SCI / STAT 403": 1,
    "COMP SCI / CURRIC 502": 1,
    "COMP SCI 537": 4,
    "COMP SCI 564": 4,
    "COMP SCI 577": 4,
    "COMP SCI 578": 1,
    "COMP SCI/L I S 614": 1,
  };
  
  // Special external (non-CS) prereq courses that are NOT 3 credits.
  const SPECIAL_EXTERNAL_CREDITS = {
    "MATH 221": 5,
    "MATH 222": 4,
    "MATH 234": 4,
    "MATH 211": 4,
    "MATH 345": 4,
    "MATH 375": 5,
    "MATH 376": 5,
    "STAT 340": 4,
  };
  
  /**
   * Given a course code like "COMP SCI 320" or "MATH 221",
   * return its number of credits.
   *
   * Default: 3 credits for anything not listed explicitly.
   */
  export function getCreditsFromCode(rawCode) {
    if (!rawCode) return null;
  
    const code = String(rawCode).replace(/\s+/g, " ").trim();
  
    if (Object.prototype.hasOwnProperty.call(SPECIAL_CS_CREDITS, code)) {
      return SPECIAL_CS_CREDITS[code];
    }
  
    if (Object.prototype.hasOwnProperty.call(SPECIAL_EXTERNAL_CREDITS, code)) {
      return SPECIAL_EXTERNAL_CREDITS[code];
    }
  
    // Default for everything else (CS and external): 3 credits
    return 3;
  }
  
// src/components/Scheduling.jsx
import { useEffect, useState } from "react";
import { getCreditsFromCode } from "../utils/credits";
import "./Scheduling.css";

/**
 * Track → preferred course codes (used only to tag "quiz" favorites).
 */
const TRACK_PREF_CODES = {
  frontend: ["COMP SCI 571", "COMP SCI 506", "COMP SCI 579", "COMP SCI 412"],
  systems: ["COMP SCI 537", "COMP SCI 640", "COMP SCI 552", "COMP SCI 564"],
  ai: ["COMP SCI 540", "COMP SCI 532", "COMP SCI 539", "COMP SCI 541"],
  theory: ["COMP SCI 577", "COMP SCI 524", "COMP SCI 525", "COMP SCI 435"],
};

/**
 * Normalize a course code so comparisons are consistent.
 * Example: "comp sci 300" → "COMP SCI 300"
 */
function norm(code) {
  return (code || "").replace(/\s+/g, " ").trim().toUpperCase();
}

/**
 * Buckets based on the requirement sections you screenshotted.
 * These are *options*, not all of them must be taken.
 */

// Basic Computer Sciences (core)
const CORE_CS = [
  "COMP SCI 240",
  "COMP SCI 252",
  "COMP SCI 300",
  "COMP SCI 354",
  "COMP SCI 400",
];

// Theory of CS
const THEORY_OPTIONS = ["COMP SCI 577", "COMP SCI 520"];

// Probability / Statistics
const PROBSTAT_OPTIONS = [
  "STAT 309",
  "STAT 311",
  "STAT 324",
  "MATH 331",
  "STAT 333",
  "STAT 340",
  "STAT 371",
  "STAT 431",
  "MATH 531",
];

// Software & Hardware (pick 2)
const SOFTHW_OPTIONS = [
  "COMP SCI 407",
  "COMP SCI 506",
  "COMP SCI 536",
  "COMP SCI 537",
  "COMP SCI 538",
  "COMP SCI 542",
  "COMP SCI 544",
  "COMP SCI 552",
  "COMP SCI 557",
  "COMP SCI 564",
  "COMP SCI 640",
  "COMP SCI 642",
];

// Applications (pick 1)
const APPLICATIONS_OPTIONS = [
  "COMP SCI 412",
  "COMP SCI 425",
  "COMP SCI 513",
  "COMP SCI 514",
  "COMP SCI 524",
  "COMP SCI 525",
  "COMP SCI 540",
  "COMP SCI 541",
  "COMP SCI 559",
  "COMP SCI 565",
  "COMP SCI 566",
  "COMP SCI 570",
  "COMP SCI 571",
];

// Electives (pick 2)
const ELECTIVES_OPTIONS = [
  "COMP SCI 407",
  "COMP SCI 412",
  "COMP SCI 425",
  "COMP SCI 435",
  "COMP SCI 471",
  "COMP SCI 475",
  "COMP SCI 506",
  "COMP SCI 513",
  "COMP SCI 514",
  "COMP SCI 518",
  "COMP SCI 520",
  "COMP SCI 524",
  "COMP SCI 525",
  "COMP SCI 526",
  "COMP SCI 532",
  "COMP SCI 533",
  "COMP SCI 534",
  "COMP SCI 536",
  "COMP SCI 537",
  "COMP SCI 538",
];

// How many courses needed from each bucket to satisfy the major
const REQUIRED_PER_BUCKET = {
  core: 5, // 240, 252, 300, 354, 400
  theory: 1,
  probstat: 1,
  softhw: 2,
  apps: 1,
  elective: 2,
};

/**
 * Very rough prerequisite map.
 * This is not an official list; it just enforces a reasonable ordering:
 * 200 → 300 → 354/400 → upper-level 5xx.
 */
const PREREQ_MAP = {
  "COMP SCI 252": ["COMP SCI 200"],
  "COMP SCI 300": ["COMP SCI 200"],
  "COMP SCI 354": ["COMP SCI 300"],
  "COMP SCI 400": ["COMP SCI 300"],

  "COMP SCI 407": ["COMP SCI 300"],
  "COMP SCI 506": ["COMP SCI 400"],

  "COMP SCI 536": ["COMP SCI 354"],
  "COMP SCI 537": ["COMP SCI 354"],
  "COMP SCI 538": ["COMP SCI 354"],
  "COMP SCI 542": ["COMP SCI 354"],
  "COMP SCI 544": ["COMP SCI 354"],
  "COMP SCI 552": ["COMP SCI 354"],
  "COMP SCI 557": ["COMP SCI 354"],
  "COMP SCI 564": ["COMP SCI 354"],
  "COMP SCI 640": ["COMP SCI 354"],
  "COMP SCI 642": ["COMP SCI 354"],

  "COMP SCI 520": ["COMP SCI 300", "COMP SCI 240"],
  "COMP SCI 577": ["COMP SCI 300", "COMP SCI 240"],

  "COMP SCI 540": ["COMP SCI 400"],
  "COMP SCI 541": ["COMP SCI 400"],
  "COMP SCI 559": ["COMP SCI 400"],
  "COMP SCI 565": ["COMP SCI 400"],
  "COMP SCI 566": ["COMP SCI 400"],
  "COMP SCI 570": ["COMP SCI 400"],
  "COMP SCI 571": ["COMP SCI 300"],

  "COMP SCI 532": ["COMP SCI 354"],
  "COMP SCI 533": ["COMP SCI 354"],
  "COMP SCI 534": ["COMP SCI 354"],
  "COMP SCI 518": ["COMP SCI 300"],

  "COMP SCI 412": ["COMP SCI 300"],
  "COMP SCI 425": ["COMP SCI 300"],
  "COMP SCI 513": ["COMP SCI 300"],
  "COMP SCI 514": ["COMP SCI 300"],
  "COMP SCI 524": ["COMP SCI 300"],
  "COMP SCI 525": ["COMP SCI 300"],
  "COMP SCI 526": ["COMP SCI 524"],

  // prob / stat option example
  "MATH 331": ["MATH 222"],
};

/**
 * Helper to extract course array from bucket JSON (still used for API fetch
 * even though the planner logic doesn't depend heavily on it).
 */
function extractBucketArray(json) {
  if (json && json.results && typeof json.results === "object") {
    const keys = Object.keys(json.results);
    if (keys.length > 0 && Array.isArray(json.results[keys[0]])) {
      return json.results[keys[0]];
    }
  }
  return [];
}

/**
 * Safely get credit value for a code, defaulting to 3 if unknown.
 */
function creditFor(code) {
  const c = getCreditsFromCode(code);
  return c && c > 0 ? c : 3;
}

/**
 * Build schedule plan.
 */
function buildPlan(form, favorites, _allCsCourses, trackPref) {
  const {
    semestersLeft,
    takenCoursesText,
    preferredLoad,
    humRemaining,
    socRemaining,
    nsRemaining,
    needsCommA,
    needsCommB,
    needsEthnic,
    needsQRA,
    needsQRB,
  } = form;

  const numSemesters = Math.max(0, Number(semestersLeft) || 0);
  if (numSemesters === 0) {
    return { semesters: [], leftoverCourses: [], leftoverPlaceholders: [] };
  }

  const minPerSem = 12;
  const maxPerSem = 18;
  const targetPerSem = Number(preferredLoad) || 15;
  const MAX_MAJOR_PER_SEM = 3; // at most 3 CS/Math/Stat per term

  // taken courses, normalized
  const takenCodes = (takenCoursesText || "")
    .split(/[,;\n]/)
    .map((s) => norm(s))
    .filter(Boolean);
  const takenSet = new Set(takenCodes);

  const favIds = new Set((favorites || []).map((f) => f.id));
  const trackCodes = TRACK_PREF_CODES[trackPref] || [];
  const trackSet = new Set(trackCodes);

  // ---- Bucket setup ----
  const BUCKETS = {
    core: CORE_CS,
    theory: THEORY_OPTIONS,
    probstat: PROBSTAT_OPTIONS,
    softhw: SOFTHW_OPTIONS,
    apps: APPLICATIONS_OPTIONS,
    elective: ELECTIVES_OPTIONS,
  };

  const bucketRemaining = {};
  Object.entries(BUCKETS).forEach(([bucket, codes]) => {
    const required = REQUIRED_PER_BUCKET[bucket] || 0;
    let already = 0;
    codes.forEach((code) => {
      if (takenSet.has(norm(code))) already += 1;
    });
    bucketRemaining[bucket] = Math.max(0, required - already);
  });

  // build candidate course list (only what we still need)
  const remainingCourses = [];
  const seen = new Set();
  const bucketOrder = ["core", "theory", "probstat", "softhw", "apps", "elective"];

  for (const bucket of bucketOrder) {
    const codes = BUCKETS[bucket];
    codes.forEach((code) => {
      const u = norm(code);
      if (takenSet.has(u)) return;
      if (seen.has(u)) return;
      if (bucketRemaining[bucket] <= 0 && bucket !== "core") return;

      const credits = creditFor(code);
      if (!credits || credits <= 0) return;

      remainingCourses.push({
        id: code,
        credits,
        bucket,
        isFavorite: favIds.has(code),
        trackPreferred: trackSet.has(code),
      });
      seen.add(u);
    });
  }

  const bucketPriority = {
    core: 0,
    theory: 1,
    probstat: 1,
    softhw: 2,
    apps: 3,
    elective: 4,
  };

  remainingCourses.sort((a, b) => {
    const pa = bucketPriority[a.bucket] ?? 99;
    const pb = bucketPriority[b.bucket] ?? 99;
    if (pa !== pb) return pa - pb;
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    if (a.trackPreferred !== b.trackPreferred) return a.trackPreferred ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  // ---- gen-ed / breadth placeholders ----
  const placeholders = [];
  if (needsCommA) placeholders.push({ label: "Comm A", credits: 3 });
  if (needsCommB) placeholders.push({ label: "Comm B", credits: 3 });
  if (needsEthnic) placeholders.push({ label: "Ethnic Studies", credits: 3 });
  if (needsQRA) placeholders.push({ label: "QR-A", credits: 3 });
  if (needsQRB) placeholders.push({ label: "QR-B", credits: 3 });

  const addBreadthPlaceholders = (remaining, label) => {
    let rem = Math.max(0, Number(remaining) || 0);
    while (rem > 0) {
      const chunk = rem >= 3 ? 3 : rem;
      placeholders.push({ label, credits: chunk });
      rem -= chunk;
    }
  };

  addBreadthPlaceholders(humRemaining, "Humanities");
  addBreadthPlaceholders(socRemaining, "Social Science");
  addBreadthPlaceholders(nsRemaining, "Natural Science");

  // ---- allocate over semesters ----
  const semesters = [];
  let year = 2026;
  let term = "Spring";

  const remaining = [...remainingCourses];
  const remainingPlaceholders = [...placeholders];

  // prereqs can only be satisfied by taken + previous semesters
  const completedSet = new Set(takenSet);

  const prereqsSatisfied = (courseId) => {
    const reqs = PREREQ_MAP[courseId] || [];
    return reqs.every((c) => completedSet.has(norm(c)));
  };

  for (let s = 0; s < numSemesters; s++) {
    let total = 0;
    let majorCount = 0;
    const cs = [];
    const reqs = [];

    // 1. schedule major courses (max 3) whose prereqs are already completed
    let madeProgress = true;
    while (
      total < targetPerSem &&
      majorCount < MAX_MAJOR_PER_SEM &&
      madeProgress
    ) {
      madeProgress = false;

      for (let i = 0; i < remaining.length; i++) {
        const c = remaining[i];

        if (bucketRemaining[c.bucket] <= 0) continue;
        if (majorCount >= MAX_MAJOR_PER_SEM) break;
        if (total + c.credits > maxPerSem) continue;
        if (!prereqsSatisfied(c.id)) continue;

        cs.push(c);
        total += c.credits;
        majorCount += 1;
        bucketRemaining[c.bucket] = Math.max(
          0,
          bucketRemaining[c.bucket] - 1
        );
        remaining.splice(i, 1);
        madeProgress = true;
        break;
      }
    }

    // 2. fill with breadth / gen-ed to reach target
    let pIndex = 0;
    while (total < targetPerSem && pIndex < remainingPlaceholders.length) {
      const p = remainingPlaceholders[pIndex];
      if (total + p.credits <= maxPerSem) {
        reqs.push(p);
        total += p.credits;
        remainingPlaceholders.splice(pIndex, 1);
      } else {
        pIndex += 1;
      }
    }

    // 3. try to at least hit minimum credits using more placeholders
    pIndex = 0;
    while (total < minPerSem && pIndex < remainingPlaceholders.length) {
      const p = remainingPlaceholders[pIndex];
      if (total + p.credits <= maxPerSem) {
        reqs.push(p);
        total += p.credits;
        remainingPlaceholders.splice(pIndex, 1);
      } else {
        pIndex += 1;
      }
    }

    semesters.push({
      termLabel: `${term} ${year}`,
      totalCredits: total,
      cs,
      placeholders: reqs,
    });

    // AFTER the semester is done, mark its courses as completed so
    // later semesters can use them as prerequisites.
    cs.forEach((c) => completedSet.add(norm(c.id)));

    if (term === "Spring") {
      term = "Fall";
    } else {
      term = "Spring";
      year += 1;
    }
  }

  return {
    semesters,
    leftoverCourses: remaining,
    leftoverPlaceholders: remainingPlaceholders,
  };
}

export default function Scheduling({ favorites = [] }) {
  const [csCourses, setCsCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [trackPref, setTrackPref] = useState(null);

  const [form, setForm] = useState({
    standing: "",
    semestersLeft: "",
    takenCoursesText: "",
    preferredLoad: 15,
    humRemaining: 0,
    socRemaining: 0,
    nsRemaining: 0,
    needsCommA: false,
    needsCommB: false,
    needsEthnic: false,
    needsQRA: false,
    needsQRB: false,
  });

  const [plan, setPlan] = useState(null);

  // read quiz result
  useEffect(() => {
    const stored = localStorage.getItem("cs-track-result");
    if (stored) setTrackPref(stored);
  }, []);

  // load courses (still fetched for completeness, not heavily used)
  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch(
          "https://cs571api.cs.wisc.edu/rest/f25/bucket/courses",
          {
            headers: {
              "X-CS571-ID":
                "bid_ce8758346d42c503b12d7449328519f5872aa6b2a86180cea1d3725294613585",
            },
          }
        );
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        const arr = extractBucketArray(json);
        setCsCourses(arr);
      } catch (err) {
        console.error(err);
        setLoadError("Could not load course data for scheduling.");
        setCsCourses([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const built = buildPlan(form, favorites, csCourses, trackPref);
    setPlan(built);
  };

  return (
    <div className="schedule-page">
      <h2>Schedule Builder</h2>

      {trackPref && (
        <div className="track-banner">
          Using your quiz track:{" "}
            <strong>
              {trackPref.charAt(0).toUpperCase() + trackPref.slice(1)}
            </strong>
        </div>
      )}

      {loading && <p>Loading course data…</p>}
      {loadError && <p className="error-text">{loadError}</p>}

      <div className="schedule-layout">
        {/* Left: quiz-like form */}
        <form className="schedule-form" onSubmit={handleSubmit}>
          <h3>Your Situation</h3>

          <label>
            Academic standing (e.g., Sophomore, Junior):
            <input
              type="text"
              name="standing"
              value={form.standing}
              onChange={handleChange}
              placeholder="e.g., Sophomore"
            />
          </label>

          <label>
            How many semesters (Fall + Spring) do you have left after Fall 2025?
            <input
              type="number"
              name="semestersLeft"
              min="1"
              max="8"
              value={form.semestersLeft}
              onChange={handleChange}
            />
          </label>

          <label>
            Which CS courses have you already completed?{" "}
            <span className="hint">(Separate with commas or new lines.)</span>
            <textarea
              name="takenCoursesText"
              rows={4}
              value={form.takenCoursesText}
              onChange={handleChange}
              placeholder="Example: COMP SCI 200, COMP SCI 240, COMP SCI 300"
            />
          </label>

          <label>
            Preferred credit load per semester:
            <select
              name="preferredLoad"
              value={form.preferredLoad}
              onChange={handleChange}
            >
              <option value={12}>12 (lighter)</option>
              <option value={15}>15 (typical)</option>
              <option value={18}>18 (heavy)</option>
            </select>
          </label>

          <h3>L&S Breadth Remaining (approx. credits)</h3>

          <div className="breadth-grid">
            <label>
              Humanities (total credits left)
              <input
                type="number"
                name="humRemaining"
                min="0"
                value={form.humRemaining}
                onChange={handleChange}
              />
            </label>
            <label>
              Social Science (total credits left)
              <input
                type="number"
                name="socRemaining"
                min="0"
                value={form.socRemaining}
                onChange={handleChange}
              />
            </label>
            <label>
              Natural Science (total credits left)
              <input
                type="number"
                name="nsRemaining"
                min="0"
                value={form.nsRemaining}
                onChange={handleChange}
              />
            </label>
          </div>

          <h3>Gen-Eds Still Needed?</h3>
          <div className="gened-grid">
            <label>
              <input
                type="checkbox"
                name="needsCommA"
                checked={form.needsCommA}
                onChange={handleChange}
              />
              Communication A
            </label>
            <label>
              <input
                type="checkbox"
                name="needsCommB"
                checked={form.needsCommB}
                onChange={handleChange}
              />
              Communication B
            </label>
            <label>
              <input
                type="checkbox"
                name="needsEthnic"
                checked={form.needsEthnic}
                onChange={handleChange}
              />
              Ethnic Studies
            </label>
            <label>
              <input
                type="checkbox"
                name="needsQRA"
                checked={form.needsQRA}
                onChange={handleChange}
              />
              Quantitative Reasoning A
            </label>
            <label>
              <input
                type="checkbox"
                name="needsQRB"
                checked={form.needsQRB}
                onChange={handleChange}
              />
              Quantitative Reasoning B
            </label>
          </div>

          <button type="submit" className="schedule-submit-btn">
            Generate Schedule
          </button>
        </form>

        {/* Right: plan preview */}
        <div className="schedule-plan">
          {!plan && (
            <p>Fill out the form and click “Generate Schedule” to see a plan.</p>
          )}

          {plan && (
            <>
              <h3>Your Planned Semesters</h3>
              {plan.semesters.length === 0 && (
                <p>No semesters generated. Check “semesters left”.</p>
              )}

              <div className="semester-grid">
                {plan.semesters.map((sem, idx) => (
                  <div key={idx} className="semester-card">
                    <h4>{sem.termLabel}</h4>
                    <div className="credits-line">
                      Total: {sem.totalCredits} credits
                    </div>

                    <div className="semester-section">
                      <div className="section-title">CS / Math / Stat</div>
                      {sem.cs.length === 0 && (
                        <div className="empty-text">
                          No major courses assigned.
                        </div>
                      )}
                      {sem.cs.map((c) => (
                        <div key={c.id} className="course-line">
                          <span>{c.id}</span>
                          <span className="course-credits">
                            {c.credits} cr
                          </span>
                          {c.isFavorite && (
                            <span className="pill pill-fav">favorite</span>
                          )}
                          {c.trackPreferred && (
                            <span className="pill pill-track">quiz</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="semester-section">
                      <div className="section-title">
                        Breadth / Gen-Ed Placeholders
                      </div>
                      {sem.placeholders.length === 0 && (
                        <div className="empty-text">None assigned.</div>
                      )}
                      {sem.placeholders.map((p, i) => (
                        <div key={i} className="course-line">
                          <span>{p.label}</span>
                          <span className="course-credits">
                            {p.credits} cr
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {(plan.leftoverCourses.length > 0 ||
                plan.leftoverPlaceholders.length > 0) && (
                <div className="leftovers">
                  <h3>Unscheduled Items</h3>

                  {plan.leftoverCourses.length > 0 && (
                    <div className="semester-section">
                      <div className="section-title">Extra Major Courses</div>
                      {plan.leftoverCourses.map((c) => (
                        <div key={c.id} className="course-line">
                          <span>{c.id}</span>
                          <span className="course-credits">
                            {c.credits} cr
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {plan.leftoverPlaceholders.length > 0 && (
                    <div className="semester-section">
                      <div className="section-title">
                        Remaining Breadth / Gen-Ed
                      </div>
                      {plan.leftoverPlaceholders.map((p, i) => (
                        <div key={i} className="course-line">
                          <span>{p.label}</span>
                          <span className="course-credits">
                            {p.credits} cr
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

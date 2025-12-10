// src/components/Scheduling.jsx
import { useEffect, useState } from "react";
import { getCreditsFromCode } from "../utils/credits";
import "./Scheduling.css";

/**
 * Track → preferred course codes.
 */
const TRACK_PREF_CODES = {
  frontend: ["COMP SCI 571", "COMP SCI 506", "COMP SCI 579", "COMP SCI 412"],
  systems: ["COMP SCI 537", "COMP SCI 640", "COMP SCI 552", "COMP SCI 564"],
  ai: ["COMP SCI 540", "COMP SCI 532", "COMP SCI 539", "COMP SCI 541"],
  theory: ["COMP SCI 577", "COMP SCI 524", "COMP SCI 525", "COMP SCI 435"],
};

/**
 * Set of course codes that count toward the CS major requirements.
 * (Basic CS, Calc, Linear Algebra, Prob/Stat, Theory, Software & HW,
 * Applications, and Electives buckets from the Guide.)
 */
const MAJOR_COURSE_CODES = new Set([
  // Basic Computer Sciences
  "COMP SCI 240",
  "COMP SCI 252",
  "COMP SCI 300",
  "COMP SCI 354",
  "COMP SCI 400",

  // Basic Calculus sequences
  "MATH 221",
  "MATH 222",
  "MATH 171",
  "MATH 217",

  // Additional Mathematics – Linear Algebra options
  "MATH 320",
  "MATH 340",
  "MATH 345",
  "MATH 341",
  "MATH 375",

  // Probability or Statistics options
  "STAT 309",
  "STAT 311",
  "STAT 324",
  "MATH 331",
  "STAT 333",
  "STAT 340",
  "STAT 371",
  "STAT 431",
  "MATH 531",

  // Theory of Computer Science
  "COMP SCI 577",
  "COMP SCI 520",

  // Software & Hardware bucket (complete two)
  "COMP SCI 407",
  "COMP SCI 506",
  "COMP SCI 536",
  "COMP SCI 538",
  "COMP SCI 537",
  "COMP SCI 542",
  "COMP SCI 544",
  "COMP SCI 552",
  "COMP SCI 557",
  "COMP SCI 564",
  "COMP SCI 640",
  "COMP SCI 642",

  // Applications bucket (complete one)
  "COMP SCI 412",
  "COMP SCI 425",
  "COMP SCI 513",
  "COMP SCI 514",
  "COMP SCI 524",
  "COMP SCI 525",
  "COMP SCI 534",
  "COMP SCI 540",
  "COMP SCI 541",
  "COMP SCI 559",
  "COMP SCI 565",
  "COMP SCI 566",
  "COMP SCI 570",
  "COMP SCI 571",

  // Electives bucket (complete two – many overlap above)
  "COMP SCI 518",
  "COMP SCI 526",
  "COMP SCI 532",
  "COMP SCI 533",
]);

const TARGET_MAJOR_CREDITS = 48; // “Requirements for the Major” total

/**
 * Helper to extract array from bucket JSON.
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
 * Build schedule plan.
 */
function buildPlan(form, favorites, allCourses, trackPref) {
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

  // taken courses, normalized
  const takenCodes = (takenCoursesText || "")
    .split(/[,;\n]/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const takenSet = new Set(takenCodes);

  // How many "major" credits have already been taken?
  let takenMajorCredits = 0;
  for (const code of takenSet) {
    if (MAJOR_COURSE_CODES.has(code)) {
      takenMajorCredits += getCreditsFromCode(code) || 0;
    }
  }
  const remainingMajorCredits = Math.max(
    0,
    TARGET_MAJOR_CREDITS - takenMajorCredits
  );

  // favorites (ids are course.code || course.id)
  const favIds = new Set((favorites || []).map((f) => f.id));

  // quiz track codes
  const trackCodes = TRACK_PREF_CODES[trackPref] || [];
  const trackSet = new Set(trackCodes);

  // remaining major courses with preference flags
  const remainingCourses = allCourses
    .map((c) => {
      const rawId = c.code || c.id || "";
      const id = rawId.toUpperCase();

      // Only consider courses that are part of the CS major requirements
      if (!MAJOR_COURSE_CODES.has(id)) {
        return null;
      }

      const title = c.name || "Untitled Course";
      const credits = getCreditsFromCode(id);

      return {
        id,
        title,
        credits,
        isFavorite: favIds.has(rawId) || favIds.has(id),
        trackPreferred: trackSet.has(id),
      };
    })
    .filter(
      (c) =>
        c &&
        c.credits > 0 &&
        !takenSet.has(c.id.toUpperCase())
    );

  // sort by: favorite → trackPreferred → id
  remainingCourses.sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    if (a.trackPreferred !== b.trackPreferred) {
      return a.trackPreferred ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  });

  // gen-ed + breadth placeholders
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

  // allocate over semesters
  const semesters = [];
  let courseIdx = 0;
  let placeholderIdx = 0;

  let plannedMajorCredits = 0;

  let year = 2026;
  let term = "Spring"; // first term after Fall 2025

  for (let s = 0; s < numSemesters; s++) {
    let total = 0;
    const cs = [];
    const reqs = [];

    const tryAddCourse = () => {
      // stop scheduling CS once we've hit the major-credit target
      if (plannedMajorCredits >= remainingMajorCredits) return false;
      if (courseIdx >= remainingCourses.length) return false;

      const c = remainingCourses[courseIdx];
      courseIdx++;

      if (total + c.credits <= maxPerSem) {
        cs.push(c);
        total += c.credits;
        plannedMajorCredits += c.credits;
        return true;
      }
      return false;
    };

    const tryAddPlaceholder = () => {
      if (placeholderIdx >= placeholders.length) return false;
      const p = placeholders[placeholderIdx];
      placeholderIdx++;
      if (total + p.credits <= maxPerSem) {
        reqs.push(p);
        total += p.credits;
        return true;
      }
      return false;
    };

    // Fill toward target preferred load
    while (
      total < targetPerSem &&
      (courseIdx < remainingCourses.length ||
        placeholderIdx < placeholders.length)
    ) {
      let picked = false;

      // Prefer major courses until we hit major-credit target
      if (
        plannedMajorCredits < remainingMajorCredits &&
        courseIdx < remainingCourses.length
      ) {
        picked = tryAddCourse();
      }

      // Then (or if no course fits) add breadth / gen-eds
      if (!picked && placeholderIdx < placeholders.length) {
        picked = tryAddPlaceholder();
      }

      if (!picked) break;
    }

    // Try to hit minimum 12 credits
    while (
      total < minPerSem &&
      (courseIdx < remainingCourses.length ||
        placeholderIdx < placeholders.length)
    ) {
      let picked = false;
      if (
        plannedMajorCredits < remainingMajorCredits &&
        courseIdx < remainingCourses.length
      ) {
        picked = tryAddCourse();
      }
      if (!picked && placeholderIdx < placeholders.length) {
        picked = tryAddPlaceholder();
      }
      if (!picked) break;
    }

    semesters.push({
      termLabel: `${term} ${year}`,
      totalCredits: total,
      cs,
      placeholders: reqs,
    });

    if (term === "Spring") {
      term = "Fall";
    } else {
      term = "Spring";
      year += 1;
    }
  }

  return {
    semesters,
    leftoverCourses: remainingCourses.slice(courseIdx),
    leftoverPlaceholders: placeholders.slice(placeholderIdx),
  };
}

export default function Scheduling({ favorites = [] }) {
  const [courses, setCourses] = useState([]);
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

  // load courses (we'll later filter to only those in MAJOR_COURSE_CODES)
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
        setCourses(arr);
      } catch (err) {
        console.error(err);
        setLoadError("Could not load course data for scheduling.");
        setCourses([]);
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
    const built = buildPlan(form, favorites, courses, trackPref);
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
        {/* Left: form */}
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
            Which CS/Math/Stat courses have you already completed?{" "}
            <span className="hint">(Separate with commas or new lines.)</span>
            <textarea
              name="takenCoursesText"
              rows={4}
              value={form.takenCoursesText}
              onChange={handleChange}
              placeholder="Example: COMP SCI 240, COMP SCI 300, MATH 221"
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

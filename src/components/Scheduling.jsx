import { useEffect, useState } from "react";
import { getCreditsFromCode } from "../utils/credits";
import "./Scheduling.css";


const TRACK_PREF_CODES = {
  frontend: ["COMP SCI 571", "COMP SCI 506", "COMP SCI 579", "COMP SCI 412"],
  systems: ["COMP SCI 537", "COMP SCI 640", "COMP SCI 552", "COMP SCI 564"],
  ai: ["COMP SCI 540", "COMP SCI 532", "COMP SCI 539", "COMP SCI 541"],
  theory: ["COMP SCI 577", "COMP SCI 524", "COMP SCI 525", "COMP SCI 435"],
};

function norm(code) {
  return (code || "").replace(/\s+/g, " ").trim().toUpperCase();
}

const CORE_CS = ["COMP SCI 240", "COMP SCI 252", "COMP SCI 300", "COMP SCI 354", "COMP SCI 400"];
const THEORY_OPTIONS = ["COMP SCI 577", "COMP SCI 520"];
const PROBSTAT_OPTIONS = [
  "STAT 309", "STAT 311", "STAT 324", "MATH 331", 
  "STAT 333", "STAT 340", "STAT 371", "STAT 431", "MATH 531"
];
const SOFTHW_OPTIONS = [
  "COMP SCI 407", "COMP SCI 506", "COMP SCI 536", "COMP SCI 537", 
  "COMP SCI 538", "COMP SCI 542", "COMP SCI 544", "COMP SCI 552", 
  "COMP SCI 557", "COMP SCI 564", "COMP SCI 640", "COMP SCI 642"
];
const APPLICATIONS_OPTIONS = [
  "COMP SCI 412", "COMP SCI 425", "COMP SCI 513", "COMP SCI 514", 
  "COMP SCI 524", "COMP SCI 525", "COMP SCI 540", "COMP SCI 541", 
  "COMP SCI 559", "COMP SCI 565", "COMP SCI 566", "COMP SCI 570", "COMP SCI 571"
];
const ELECTIVES_OPTIONS = [
  "COMP SCI 407", "COMP SCI 412", "COMP SCI 425", "COMP SCI 435", 
  "COMP SCI 471", "COMP SCI 475", "COMP SCI 506", "COMP SCI 513", 
  "COMP SCI 514", "COMP SCI 518", "COMP SCI 520", "COMP SCI 524", 
  "COMP SCI 525", "COMP SCI 526", "COMP SCI 532", "COMP SCI 533", 
  "COMP SCI 534", "COMP SCI 536", "COMP SCI 537", "COMP SCI 538"
];

const REQUIRED_PER_BUCKET = {
  core: 5, theory: 1, probstat: 1, softhw: 2, apps: 1, elective: 2
};

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
  "MATH 331": ["MATH 222"],
};

function extractBucketArray(json) {
  if (json && json.results && typeof json.results === "object") {
    const keys = Object.keys(json.results);
    if (keys.length > 0 && Array.isArray(json.results[keys[0]])) {
      return json.results[keys[0]];
    }
  }
  return [];
}

function creditFor(code) {
  const c = getCreditsFromCode(code);
  return c && c > 0 ? c : 3;
}


function buildPlan(form, favorites, _allCsCourses, trackPref) {
  const {
    semestersLeft, takenCoursesText, preferredLoad,
    humRemaining, socRemaining, nsRemaining,
    needsCommA, needsCommB, needsEthnic, needsQRA, needsQRB
  } = form;

  const numSemesters = Math.max(0, Number(semestersLeft) || 0);
  if (numSemesters === 0) {
    return { semesters: [], leftoverCourses: [], leftoverPlaceholders: [] };
  }

  const minPerSem = 12;
  const maxPerSem = 18;
  const targetPerSem = Number(preferredLoad) || 15;
  const MAX_MAJOR_PER_SEM = 3;

  const takenCodes = (takenCoursesText || "")
    .split(/[,;\n]/)
    .map((s) => norm(s))
    .filter(Boolean);
  const takenSet = new Set(takenCodes);

  const favIds = new Set((favorites || []).map((f) => f.id));
  const trackCodes = TRACK_PREF_CODES[trackPref] || [];
  const trackSet = new Set(trackCodes);

  const BUCKETS = {
    core: CORE_CS, theory: THEORY_OPTIONS, probstat: PROBSTAT_OPTIONS,
    softhw: SOFTHW_OPTIONS, apps: APPLICATIONS_OPTIONS, elective: ELECTIVES_OPTIONS
  };

  const initialBucketNeeds = {};
  Object.entries(BUCKETS).forEach(([bucket, codes]) => {
    const required = REQUIRED_PER_BUCKET[bucket] || 0;
    let already = 0;
    codes.forEach((code) => {
      if (takenSet.has(norm(code))) already += 1;
    });
    initialBucketNeeds[bucket] = Math.max(0, required - already);
  });

  const currentBucketNeeds = { ...initialBucketNeeds };

  const remainingCourses = [];
  const seen = new Set();
  const bucketKeys = ["core", "theory", "probstat", "softhw", "apps", "elective"];

  for (const bucket of bucketKeys) {
    const codes = BUCKETS[bucket];
    codes.forEach((code) => {
      const u = norm(code);
      if (takenSet.has(u)) return;
      if (seen.has(u)) return;

      const credits = creditFor(code);
      if (!credits || credits <= 0) return;

      remainingCourses.push({
        id: code, credits, bucket,
        isFavorite: favIds.has(code),
        trackPreferred: trackSet.has(code)
      });
      seen.add(u);
    });
  }

  const bucketPriority = {
    core: 0, theory: 1, probstat: 2, softhw: 3, apps: 4, elective: 5
  };

  remainingCourses.sort((a, b) => {
    const needA = initialBucketNeeds[a.bucket] > 0;
    const needB = initialBucketNeeds[b.bucket] > 0;
    if (needA !== needB) return needA ? -1 : 1;

    const pa = bucketPriority[a.bucket] ?? 99;
    const pb = bucketPriority[b.bucket] ?? 99;
    if (pa !== pb) return pa - pb;

    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    if (a.trackPreferred !== b.trackPreferred) return a.trackPreferred ? -1 : 1;

    return a.id.localeCompare(b.id);
  });

  const placeholders = [];
  if (needsCommA) placeholders.push({ label: "Comm A", credits: 3 });
  if (needsCommB) placeholders.push({ label: "Comm B", credits: 3 });
  if (needsEthnic) placeholders.push({ label: "Ethnic Studies", credits: 3 });
  if (needsQRA) placeholders.push({ label: "QR-A", credits: 3 });
  if (needsQRB) placeholders.push({ label: "QR-B", credits: 3 });

  const addBreadth = (remaining, label) => {
    let rem = Math.max(0, Number(remaining) || 0);
    while (rem > 0) {
      const chunk = rem >= 3 ? 3 : rem;
      placeholders.push({ label, credits: chunk });
      rem -= chunk;
    }
  };
  addBreadth(humRemaining, "Humanities");
  addBreadth(socRemaining, "Social Science");
  addBreadth(nsRemaining, "Natural Science");

  const semesters = [];
  let year = 2026;
  let term = "Spring";

  const remainingCandidates = [...remainingCourses];
  const remainingPlaceholders = [...placeholders];
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

    let madeProgress = true;
    while (total < targetPerSem && majorCount < MAX_MAJOR_PER_SEM && madeProgress) {
      madeProgress = false;
      for (let i = 0; i < remainingCandidates.length; i++) {
        const c = remainingCandidates[i];
        if (majorCount >= MAX_MAJOR_PER_SEM) break;
        if (total + c.credits > maxPerSem) continue;
        if (!prereqsSatisfied(c.id)) continue;

        cs.push(c);
        total += c.credits;
        majorCount += 1;
        currentBucketNeeds[c.bucket] = Math.max(0, currentBucketNeeds[c.bucket] - 1);
        remainingCandidates.splice(i, 1);
        madeProgress = true;
        break; 
      }
    }

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
      placeholders: reqs
    });

    cs.forEach((c) => completedSet.add(norm(c.id)));
    if (term === "Spring") { term = "Fall"; } else { term = "Spring"; year += 1; }
  }

  return { semesters, leftoverCourses: remainingCandidates, leftoverPlaceholders: remainingPlaceholders };
}


export default function Scheduling({ favorites = [] }) {
  const [csCourses, setCsCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [trackPref, setTrackPref] = useState(null);
  const [plan, setPlan] = useState(null);

  const [form, setForm] = useState({
    standing: "", semestersLeft: "", takenCoursesText: "", preferredLoad: 15,
    humRemaining: 0, socRemaining: 0, nsRemaining: 0,
    needsCommA: false, needsCommB: false, needsEthnic: false, needsQRA: false, needsQRB: false
  });

  useEffect(() => {
    const stored = localStorage.getItem("cs-track-result");
    if (stored) setTrackPref(stored);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch("https://cs571api.cs.wisc.edu/rest/f25/bucket/courses", {
          headers: { "X-CS571-ID": "bid_ce8758346d42c503b12d7449328519f5872aa6b2a86180cea1d3725294613585" }
        });
        if (!res.ok) throw new Error(`API error`);
        const json = await res.json();
        setCsCourses(extractBucketArray(json));
      } catch (err) {
        console.error(err);
        setLoadError("Could not load course data.");
        setCsCourses([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
          Using your quiz track: <strong>{trackPref.charAt(0).toUpperCase() + trackPref.slice(1)}</strong>
        </div>
      )}
      {loading && <p>Loading course data…</p>}
      {loadError && <p className="error-text">{loadError}</p>}

      <div className="schedule-layout">
        <form className="schedule-form" onSubmit={handleSubmit}>
          <h3>Your Situation</h3>
          <label>Academic standing:
            <input type="text" name="standing" value={form.standing} onChange={handleChange} placeholder="e.g., Sophomore" />
          </label>
          <label>Semesters Left:
            <input type="number" name="semestersLeft" min="1" max="8" value={form.semestersLeft} onChange={handleChange} />
          </label>
          <label>Taken Courses (comma separated):
            <textarea name="takenCoursesText" rows={4} value={form.takenCoursesText} onChange={handleChange} placeholder="COMP SCI 200, COMP SCI 300..." />
          </label>
          <label>Preferred Load:
            <select name="preferredLoad" value={form.preferredLoad} onChange={handleChange}>
              <option value={12}>12 (lighter)</option>
              <option value={15}>15 (typical)</option>
              <option value={18}>18 (heavy)</option>
            </select>
          </label>
          <h3>Breadth Credits Needed</h3>
          <div className="breadth-grid">
            <label>Humanities <input type="number" name="humRemaining" min="0" value={form.humRemaining} onChange={handleChange} /></label>
            <label>Social Science <input type="number" name="socRemaining" min="0" value={form.socRemaining} onChange={handleChange} /></label>
            <label>Natural Science <input type="number" name="nsRemaining" min="0" value={form.nsRemaining} onChange={handleChange} /></label>
          </div>
          <h3>Gen-Eds Needed</h3>
          <div className="gened-grid">
            <label><input type="checkbox" name="needsCommA" checked={form.needsCommA} onChange={handleChange} /> Comm A</label>
            <label><input type="checkbox" name="needsCommB" checked={form.needsCommB} onChange={handleChange} /> Comm B</label>
            <label><input type="checkbox" name="needsEthnic" checked={form.needsEthnic} onChange={handleChange} /> Ethnic</label>
            <label><input type="checkbox" name="needsQRA" checked={form.needsQRA} onChange={handleChange} /> QR-A</label>
            <label><input type="checkbox" name="needsQRB" checked={form.needsQRB} onChange={handleChange} /> QR-B</label>
          </div>
          <button type="submit" className="schedule-submit-btn">Generate Schedule</button>
        </form>

        <div className="schedule-plan">
          {!plan && <p>Fill out the form to see a plan.</p>}
          {plan && (
            <>
              <h3>Your Planned Semesters</h3>
              {plan.semesters.map((sem, idx) => (
                <div key={idx} className="semester-card">
                  <h4>{sem.termLabel}</h4>
                  <div className="credits-line">Total: {sem.totalCredits} credits</div>
                  
                  <div className="semester-section">
                    <div className="section-title">CS / Math / Stat</div>
                    {sem.cs.length === 0 && <div className="empty-text">No major courses assigned.</div>}
                    {sem.cs.map((c) => (
                      <div key={c.id} className="course-line">
                        <div className="course-left">
                          <span className="course-id-text">{c.id}</span>
                          {c.trackPreferred && (
                            <span className="pill pill-track">quiz</span>
                          )}
                          {c.isFavorite && (
                            <span className="pill pill-fav">favorite</span>
                          )}
                        </div>

                        <div className="course-meta">
                          <span className="course-credits">{c.credits} cr</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="semester-section">
                    <div className="section-title">Breadth / Gen-Ed</div>
                    {sem.placeholders.length === 0 && <div className="empty-text">None.</div>}
                    {sem.placeholders.map((p, i) => (
                      <div key={i} className="course-line">
                        <span className="course-id-text">{p.label}</span>
                        <div className="course-meta">
                          <span className="course-credits">{p.credits} cr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {(plan.leftoverCourses.length > 0 || plan.leftoverPlaceholders.length > 0) && (
                <div className="leftovers">
                  <h3>Unscheduled Items</h3>
                  {plan.leftoverCourses.length > 0 && (
                    <div className="semester-section">
                      <div className="section-title">Extra Major Courses</div>
                      {plan.leftoverCourses.map((c) => (
                        <div key={c.id} className="course-line">
                          <span className="course-id-text">{c.id}</span>
                          <div className="course-meta">
                            <span className="course-credits">{c.credits} cr</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {plan.leftoverPlaceholders.length > 0 && (
                    <div className="semester-section">
                      <div className="section-title">Remaining Breadth</div>
                      {plan.leftoverPlaceholders.map((p, i) => (
                        <div key={i} className="course-line">
                          <span className="course-id-text">{p.label}</span>
                          <div className="course-meta">
                            <span className="course-credits">{p.credits} cr</span>
                          </div>
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
// src/components/Classes.jsx
import { useEffect, useState } from "react";
import ClassCard from "./ClassCard";
import "./Classes.css";
import { getCreditsFromCode } from "../utils/credits";

// ====== prereq cleanup helpers ======
const PREREQ_ALIASES = {
  "COMP SCI 102": "COMP SCI / LIS 102",
  "MATH/COMP SCI 240": "COMP SCI / MATH 240",
  "STAT/COMP SCI/MATH 475": "COMP SCI / MATH / STAT 475",
};

function normalizePrereqCode(s) {
  return PREREQ_ALIASES[s] ?? s;
}

const LEGACY_CS = new Set([
  "COMP SCI 301",
  "COMP SCI 302",
  "COMP SCI 319",
  "COMP SCI 367",
  "COMP SCI 545",
  "COMP SCI 679",
]);

function cleanPrereqs(rawList = []) {
  return rawList
    .map(normalizePrereqCode)
    .filter((p) => p && !LEGACY_CS.has(p));
}

// Helper to safely dig into bucket JSON
function extractBucketArray(json) {
  if (json && json.results && typeof json.results === "object") {
    const keys = Object.keys(json.results);
    if (keys.length > 0 && Array.isArray(json.results[keys[0]])) {
      return json.results[keys[0]];
    }
  }
  return [];
}

// Turn raw API course into what ClassCard expects
function toCardCourse(rawCourse) {
  const id = rawCourse.code || rawCourse.id;
  return {
    id,
    title: rawCourse.name || "Untitled Course",
    desc: rawCourse.description || "No description available.",
    category: rawCourse.category || null,
    prereqs: cleanPrereqs(rawCourse.preReq || rawCourse.prereq || []),
    credits: getCreditsFromCode(id),
  };
}

// ====== main component ======
export default function Classes({ favorites, onToggleFavorite }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState(""); // "" = all, "cs" = CS only
  const [csCourses, setCsCourses] = useState([]);
  const [externalCourses, setExternalCourses] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        const [csRes, extRes] = await Promise.all([
          fetch("https://cs571api.cs.wisc.edu/rest/f25/bucket/courses", {
            headers: {
              "X-CS571-ID":
                "bid_ce8758346d42c503b12d7449328519f5872aa6b2a86180cea1d3725294613585",
            },
          }),
          fetch("https://cs571api.cs.wisc.edu/rest/f25/bucket/external", {
            headers: {
              "X-CS571-ID":
                "bid_ce8758346d42c503b12d7449328519f5872aa6b2a86180cea1d3725294613585",
            },
          }),
        ]);

        if (!csRes.ok) {
          throw new Error(`CS API error: ${csRes.status} ${csRes.statusText}`);
        }
        if (!extRes.ok) {
          // external failing shouldn’t kill the whole page; log & continue
          console.warn(
            `External API error: ${extRes.status} ${extRes.statusText}`
          );
        }

        const csJson = await csRes.json();
        const extJson = extRes.ok ? await extRes.json() : null;

        const csLoaded = extractBucketArray(csJson);
        const extLoaded = extJson ? extractBucketArray(extJson) : [];

        setCsCourses(csLoaded);
        setExternalCourses(extLoaded);

        if (csLoaded.length === 0 && extLoaded.length === 0) {
          setErrorMsg("No courses found.");
        } else {
          setErrorMsg("");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Could not load courses. Please try again later.");
        setCsCourses([]);
        setExternalCourses([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const query = searchQuery.toLowerCase();

  const matchesSearch = (course) => {
    const name = (course.name || "").toLowerCase();
    const code = (course.code || course.id || "").toLowerCase();
    return name.includes(query) || code.includes(query);
  };

  // CS courses obey subject filter
const visibleCs = (!loading && !errorMsg ? csCourses : []).filter(
    (course) => {
      if (subjectFilter === "external") return false;

      if (!matchesSearch(course)) return false;
      const isCsSubject = (course.code || "").startsWith("COMP SCI");
      if (subjectFilter === "cs") {
        return isCsSubject;
      }
      return true;
    }
  );

  // External prereq courses only show when "All Subjects" is selected
  const visibleExternal =
    !loading && !errorMsg && (subjectFilter === "" || subjectFilter === "external")
      ? externalCourses.filter(matchesSearch)
      : [];

  const visibleCourses = [
    ...visibleCs.map(toCardCourse),
    ...visibleExternal.map(toCardCourse),
  ];

  return (
    <div className="classes-page">
      {/* filter bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          name="subject"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="">All Subjects</option>
          <option value="cs">Computer Science</option>
          <option value="external">External/Non-CS</option>
        </select>
        {/* Gen Ed filter intentionally removed */}
      </div>

      <div className="class-grid-container">
        {loading && <p className="status-text">Loading courses…</p>}
        {!loading && errorMsg && (
          <p className="status-text">{errorMsg}</p>
        )}

        <div className="class-grid">
          {!loading &&
            !errorMsg &&
            visibleCourses.map((courseForCard) => {
              const isFavorite = favorites.some(
                (fav) => fav.id === courseForCard.id
              );

              return (
                <ClassCard
                  key={courseForCard.id}
                  course={courseForCard}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}

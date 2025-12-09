// src/components/Classes.jsx
import { useEffect, useState } from "react";
import ClassCard from "./ClassCard";
import "./Classes.css";

// --- Helpers to clean prereqs ---

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

// Helper to pull array out of bucket response
function extractBucketArray(data) {
  if (data && data.results && typeof data.results === "object") {
    const keys = Object.keys(data.results);
    if (keys.length > 0 && Array.isArray(data.results[keys[0]])) {
      return data.results[keys[0]];
    }
  }
  return [];
}

export default function Classes({ favorites, onToggleFavorite }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all"); // all | cs | external
  const [courses, setCourses] = useState([]);
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

        if (!csRes.ok || !extRes.ok) {
          throw new Error(
            `API error: cs=${csRes.status} external=${extRes.status}`
          );
        }

        const csJson = await csRes.json();
        const extJson = await extRes.json();

        const csArray = extractBucketArray(csJson);
        const extArray = extractBucketArray(extJson);

        setCourses(csArray);
        setExternalCourses(extArray);

        if (csArray.length === 0 && extArray.length === 0) {
          setErrorMsg("No courses found.");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Could not load courses. Please try again later.");
        setCourses([]);
        setExternalCourses([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const query = searchQuery.toLowerCase();

  const filteredCsCourses = courses.filter((course) => {
    if (subjectFilter === "external") return false;

    const name = (course.name || "").toLowerCase();
    const code = (course.code || course.id || "").toLowerCase();
    return name.includes(query) || code.includes(query);
  });

  const filteredExternalCourses = externalCourses.filter((course) => {
    if (subjectFilter === "cs") return false;

    const name = (course.name || "").toLowerCase();
    const code = (course.code || course.id || "").toLowerCase();
    return name.includes(query) || code.includes(query);
  });

  return (
    <div className="classes-page">
      {/* Filter bar */}
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
          <option value="all">All Subjects</option>
          <option value="cs">Computer Science</option>
          <option value="external">External / Non-CS</option>
        </select>
      </div>

      <div className="class-grid-container">
        {loading && <p className="status-text">Loading courses…</p>}
        {!loading && errorMsg && <p className="status-text">{errorMsg}</p>}

        {!loading && !errorMsg && (
          <>
            {/* CS section */}
            {filteredCsCourses.length > 0 && (
              <>
                <h2 className="section-title">Computer Science Courses</h2>
                <div className="class-grid">
                  {filteredCsCourses.map((course) => {
                    const courseForCard = {
                      id: course.code || course.id,
                      title: course.name || "Untitled Course",
                      desc: course.description || "No description available.",
                      category: course.category || null,
                      prereqs: cleanPrereqs(
                        course.preReq || course.prereq || []
                      ),
                    };

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
              </>
            )}

            {/* External section */}
            {filteredExternalCourses.length > 0 && (
              <>
                <h2 className="section-title">
                  Related Non-CS / External Courses
                </h2>
                <div className="class-grid">
                  {filteredExternalCourses.map((course) => {
                    const courseForCard = {
                      id: course.code || course.id,
                      title: course.name || "Untitled Course",
                      desc: course.description || "No description available.",
                      category: course.category || "External Prerequisite",
                      prereqs: cleanPrereqs(
                        course.preReq || course.prereq || []
                      ),
                    };

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
              </>
            )}

            {!filteredCsCourses.length &&
              !filteredExternalCourses.length &&
              !loading &&
              !errorMsg && (
                <p className="status-text">
                  No courses match your current filters.
                </p>
              )}
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import ClassCard from './ClassCard';
import './Classes.css';

export default function Classes({ favorites, onToggleFavorite }) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://cs571api.cs.wisc.edu/rest/f25/bucket/courses", {
      
      headers: {
        "X-CS571-ID": "bid_ce8758346d42c503b12d7449328519f5872aa6b2a86180cea1d3725294613585"
      }

    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      }) 
      .then(data => {
        let loadedCourses = [];
        if (data && data.results && typeof data.results === "object") {
          const keys = Object.keys(data.results);
          if (keys.length > 0 && Array.isArray(data.results[keys[0]])) {
            loadedCourses = data.results[keys[0]];
          }
        }
        setCourses(loadedCourses);
        setErrorMsg(loadedCourses.length === 0 ? "No courses found." : "");
      })
      .catch(err => {
        console.error(err);
        setErrorMsg("Could not load courses. Please try again later.");
        setCourses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  
  return (
    <div className="classes-page">
      
      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="Search by name or ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select name="subject">
          <option value="">All Subjects</option>
          <option value="cs">Computer Science</option>
        </select>
        <select name="gen-ed">
          <option value="">All Gen Eds</option>
        </select>
      </div>

      <div className="class-grid-container">
        
        {loading && <p className="status-text">Loading courses…</p>}
        {!loading && errorMsg && <p className="status-text">{errorMsg}</p>}

        <div className="class-grid">
          {!loading && !errorMsg && courses
          .filter((course) => {
            const query = searchQuery.toLowerCase();
            const name = (course.name || "").toLowerCase();
            const code = (course.code || course.id || "").toLowerCase();
            return name.includes(query) || code.includes(query);
          })
        .map((course) => {
            
            const courseForCard = {
              id: course.code || course.id,
              title: course.name || "Untitled Course",
              desc: course.description || "No description available.",
  
              category: course.category || null,
              prereqs: (course.preReq || course.prereq || []).filter(Boolean)
        };

            const isFavorite = favorites.some((fav) => fav.id === courseForCard.id);

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
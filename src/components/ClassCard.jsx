import React from 'react';
import './Classes.css';

export default function ClassCard({ course, isFavorite, onToggleFavorite }) {
  return (
    <div className="class-card">
      <div className="card-header">
        <span className="course-id">{course.id}</span>
        
        {typeof course.credits === "number" && (
          <span className="course-credits">
            {course.credits} Credit{course.credits !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <h3 className="course-title">{course.title}</h3>
      <p className="course-desc">{course.desc}</p>

      <div className="card-footer">
        {/* CATEGORY */}
        {course.category && (
          <span className="course-tag category-tag">
            {course.category}
          </span>
        )}

        {/* PREREQS */}
        {course.prereqs.map((prereq) => (
          <span key={prereq} className="course-tag prereq-tag">
            {prereq}
          </span>
        ))}
      </div>

      <button 
        className={`fav-button ${isFavorite ? 'active' : ''}`}
        onClick={() => onToggleFavorite(course)}
      >
        ♥
      </button>
    </div>
  );
}
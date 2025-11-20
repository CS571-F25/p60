import React from 'react';
import './Classes.css';


export default function ClassCard({ course }) {
  return (
    <div className="class-card">
      <div className="card-header">
        <span className="course-id">{course.id}</span>
    </div>
      <h3 className="course-title">{course.title}</h3>
      <p className="course-desc">{course.desc}</p>
      
      <div className="card-footer">
        {course.category && (
            <span className="course-tag category-tag">
        {course.category}
     </span>
    )}
  
    {course.prereqs.map((prereq) => (
        <span key={prereq} className="course-tag prereq-tag">
        {prereq}
        </span>
    ))}
    </div>
      
      <button className="fav-button">♥</button>
    </div>
  );
}
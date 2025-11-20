import React from 'react';
import { Link } from 'react-router-dom';
import ClassCard from './ClassCard';
import './Classes.css';

export default function Favorites({ favorites, onToggleFavorite }) {
  
  return (
    <div className="favorites-page-container">
      
      {favorites.length === 0 ? (
        
        <div className="favorites-empty">
          <h2>Your favorites list is empty!</h2>
          <p>Browse the course catalog and click the heart on any class to save it here.</p>
          <Link to="/classes" className="go-to-classes-btn">
            Browse Classes
          </Link>
        </div>

      ) : (

        <div className="class-grid-container">
          <h2 className="page-title">My Favorite Courses</h2>
          <div className="class-grid">
            
            {favorites.map((course) => (
              <ClassCard 
                key={course.id} 
                course={course}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>

      )}
    </div>
  );
}
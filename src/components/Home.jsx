import './Home.css'; 
import MorgImage from '../assets/morg.jpg';

export default function Home() {
  return (
    <>
      <div className="home-hero">
        <h1>Welcome to CompileMyDegree</h1>
        <p>
          Plan your semesters, explore CS classes, and track your degree progress.
        </p>
      </div>

      <section className="features-section">
        <h2>Everything You Need to Graduate</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Explore Course Catalogs</h3>
            <p>Browse all required classes, electives, and gen-eds. Expand any course to see its full description and prerequisites.</p>
          </div>
          <div className="feature-card">
            <h3>Generate Your Schedule</h3>
            <p>Tell us your remaining semesters and target credits, and we'll generate a valid plan that follows all class dependencies.</p>
          </div>
          <div className="feature-card">
            <h3>Track, Quiz, & Customize</h3>
            <p>Save favorites, track completed courses, and even take a quiz to get personalized elective suggestions.</p>
          </div>
        </div>
      </section>

      <section className="spotlight-section">
        <div className="spotlight-content">
          <div className="spotlight-text">
            <h2>Visit the New CS Building</h2>
            <p>
              Morgridge Hall is a 343,000 square foot building in the heart of the tech corridor on campus. As the home for the School of Computer, Data & Information Sciences, it brings together the departments of Computer Sciences, Statistics, and the Information School alongside Biostatistics & Medical Informatics,  and the Data Science Institute, and the Center for High Throughput Computing.
            </p>
            <p>
              Study, collaborate, and innovate in the state-of-the-art new Computer Sciences building. Home to cutting-edge labs, spacious study areas, and faculty offices.
            </p>
          </div>
          <div className="spotlight-image">
            <img src={MorgImage} alt="New Computer Sciences Building" />
          </div>
        </div>
      </section>
    </>
  );
}
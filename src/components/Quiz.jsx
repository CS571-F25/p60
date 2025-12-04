import React, { useState } from 'react';
import './Quiz.css'; 

//4 types of results (frontend, systems, ai, and theiry)
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What part of a project do you enjoy the most?",
    options: [
      { text: "Designing the look and feel", type: "frontend" },
      { text: "Optimizing code and memory management", type: "systems" },
      { text: "Training models to make predictions", type: "ai" },
      { text: "Proving the algorithm is mathematically correct", type: "theory" },
    ]
  },
  {
    id: 2,
    question: "Which language/tool helps you flow best?",
    options: [
      { text: "JavaScript/React/HTML", type: "frontend" },
      { text: "C/C++/Assembly", type: "systems" },
      { text: "Python/PyTorch/Pandas", type: "ai" },
      { text: "Math Notation/Functional Languages", type: "theory" },
    ]
  },
  {
    id: 3,
    question: "Pick a dream project:",
    options: [
      { text: "Building a social media app", type: "frontend" },
      { text: "Writing an operating system kernel", type: "systems" },
      { text: "Creating a chatbot like ChatGPT", type: "ai" },
      { text: "Solving P vs NP", type: "theory" },
    ]
  }
];

const SUGGESTIONS = {
  frontend: {
    title: "Software & Interfaces",
    desc: "You thrive on building tangible products. This track focuses on the user-facing and architectural side of software.",
    classes: [
      "CS 571: Building User Interfaces", 
      "CS 639: Mobile Application Development", 
      "CS 506: Software Engineering",
      "CS 579: Virtual Reality"
    ]
  },
  systems: {
    title: "Systems & Hardware",
    desc: "You like looking under the hood. This track deals with performance, resource management, and how software meets hardware.",
    classes: [
      "CS 537: Intro to Operating Systems", 
      "CS 640: Computer Networks", 
      "CS 552: Computer Architecture",
      "CS 564: Database Management Systems"
    ]
  },
  ai: {
    title: "AI & Machine Learning",
    desc: "You enjoy teaching computers to think. This track focuses on data analysis, prediction models, and intelligent agents.",
    classes: [
      "CS 540: Intro to Artificial Intelligence", 
      "CS 532: Matrix Methods for ML", 
      "CS 539: Neural Networks",
      "CS 760: Machine Learning"
    ]
  },
  theory: {
    title: "Theory & Algorithms",
    desc: "You prefer the abstract and exact. This track explores the mathematical limitations and capabilities of computing.",
    classes: [
      "CS 525: Linear Programming", 
      "CS 577: Intro to Algorithms", 
      "CS 524: Intro to Optimization", 
      "CS 435: Cryptography"
    ]
  }
};

export default function Quiz() {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({ frontend: 0, systems: 0, ai: 0, theory: 0 });
  const [result, setResult] = useState(null);

  const handleStart = () => {
    setStarted(true);
    setCurrentQuestion(0);
    setScores({ frontend: 0, systems: 0, ai: 0, theory: 0 });
    setResult(null);
  };

  const handleAnswer = (type) => {
    const newScores = { ...scores, [type]: scores[type] + 1 };
    setScores(newScores);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = (finalScores) => {
    let maxType = Object.keys(finalScores).reduce((a, b) => 
      finalScores[a] > finalScores[b] ? a : b
    );
    setResult(maxType);
  };

  const wrapperClass = "quiz-wrapper";

  if (!started) {
    return (
      <div className={wrapperClass}>
        <div className="quiz-card">
          <h2 className="quiz-title">Discover Your Path</h2>
          <p className="quiz-subtitle">
            Answer {QUIZ_QUESTIONS.length} quick questions to find your perfect CS track.
          </p>
          <button onClick={handleStart} className="quiz-btn-primary">
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const suggestion = SUGGESTIONS[result];
    return (
      <div className={wrapperClass}>
        <div className="quiz-card">
          
          <div className="result-header">
            <div className="result-label">Recommended Track</div>
            <h3 className="result-title">{suggestion.title}</h3>
            <p className="result-desc">{suggestion.desc}</p>
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: '800', color: '#111', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              Suggested Electives
            </h4>
            
            <div className="class-grid">
              {suggestion.classes.map((c, i) => {
                const [code, ...nameParts] = c.split(':');
                const name = nameParts.join(':');

                return (
                  <div key={i} className="class-card">
                     <span className="class-code">{code}</span>
                     <span className="class-name">{name || code}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={handleStart} className="btn-reset">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const q = QUIZ_QUESTIONS[currentQuestion];

  return (
    <div className={wrapperClass}>
      <div className="quiz-content">
        <h2 className="quiz-question">
          {q.question}
        </h2>
        
        <div className="quiz-options-grid">
          {q.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option.type)}
              className="quiz-option-btn"
            >
              {option.text}
            </button>
          ))}
        </div>
        
        <div style={{ marginTop: '3rem', color: '#9ca3af', fontWeight: '500' }}>
          Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
        </div>
      </div>
    </div>
  );
}
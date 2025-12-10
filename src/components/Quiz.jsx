// src/components/Quiz.jsx
import React, { useState, useEffect } from "react";
import "./Quiz.css";

// 4 types of results (frontend, systems, ai, theory)
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What part of a project do you enjoy the most?",
    options: [
      { text: "Designing the look and feel", type: "frontend" },
      { text: "Optimizing code and memory management", type: "systems" },
      { text: "Training models to make predictions", type: "ai" },
      { text: "Proving the algorithm is mathematically correct", type: "theory" },
    ],
  },
  {
    id: 2,
    question: "Which language/tool helps you flow best?",
    options: [
      { text: "JavaScript/React/HTML", type: "frontend" },
      { text: "C/C++/Assembly", type: "systems" },
      { text: "Python/PyTorch/Pandas", type: "ai" },
      { text: "Math notation/functional languages", type: "theory" },
    ],
  },
  {
    id: 3,
    question: "Pick a dream project:",
    options: [
      { text: "Building a social media app", type: "frontend" },
      { text: "Writing an operating system kernel", type: "systems" },
      { text: "Creating a chatbot like ChatGPT", type: "ai" },
      { text: "Solving P vs NP", type: "theory" },
    ],
  },
];

const SUGGESTIONS = {
  frontend: {
    title: "Software & Interfaces",
    desc: "You thrive on building tangible products. This track focuses on user-facing and architectural sides of software.",
    classes: [
      "COMP SCI 571: Building User Interfaces",
      "COMP SCI 506: Software Engineering",
      "COMP SCI 579: Virtual Reality",
      "COMP SCI 412: Numerical Methods (UI-adjacent modeling)",
    ],
  },
  systems: {
    title: "Systems & Hardware",
    desc: "You like looking under the hood: performance, resource management, and how software meets hardware.",
    classes: [
      "COMP SCI 537: Operating Systems",
      "COMP SCI 640: Computer Networks",
      "COMP SCI 552: Computer Architecture",
      "COMP SCI 564: Database Management Systems",
    ],
  },
  ai: {
    title: "AI & Machine Learning",
    desc: "You enjoy teaching computers to think: data, models, and intelligent agents.",
    classes: [
      "COMP SCI 540: Artificial Intelligence",
      "COMP SCI 532: Matrix Methods in Machine Learning",
      "COMP SCI 539: Artificial Neural Networks",
      "COMP SCI 541: Theory & Algorithms for Data Science",
    ],
  },
  theory: {
    title: "Theory & Algorithms",
    desc: "You like the abstract and exact: what can and cannot be computed, and how efficiently.",
    classes: [
      "COMP SCI 577: Introduction to Algorithms",
      "COMP SCI 524: Introduction to Optimization",
      "COMP SCI 525: Linear Optimization",
      "COMP SCI 435: Introduction to Cryptography",
    ],
  },
};

export default function Quiz() {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({
    frontend: 0,
    systems: 0,
    ai: 0,
    theory: 0,
  });
  const [result, setResult] = useState(null);

  // Persist quiz result for use in Scheduling
  useEffect(() => {
    if (result) {
      localStorage.setItem("cs-track-result", result);
    }
  }, [result]);

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
    const maxType = Object.keys(finalScores).reduce((a, b) =>
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
            Answer {QUIZ_QUESTIONS.length} quick questions to find your CS focus.
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

          <div style={{ textAlign: "left" }}>
            <h4
              style={{
                fontWeight: "800",
                color: "#111",
                marginBottom: "1.5rem",
                fontSize: "1.1rem",
              }}
            >
              Suggested Electives
            </h4>

            <div className="class-grid">
              {suggestion.classes.map((c, i) => {
                const [code, ...nameParts] = c.split(":");
                const name = nameParts.join(":");
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
        <h2 className="quiz-question">{q.question}</h2>

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

        <div style={{ marginTop: "3rem", color: "#9ca3af", fontWeight: "500" }}>
          Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
        </div>
      </div>
    </div>
  );
}

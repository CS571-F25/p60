// src/components/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Card,
  ToggleButtonGroup,
  ToggleButton,
} from "react-bootstrap";

const USERS_KEY = "cmd-users"; // username -> { password }

function loadUsers() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    console.error("Failed to load users:", e);
    return {};
  }
}

function saveUsers(users) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users:", e);
  }
}

export default function Login({ onLogin, currentUser }) {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setMsg("");
    setPassword("");
    setConfirmPw("");
  }, [mode]);

  if (currentUser) {
    return (
      <Container style={{ padding: "2rem", maxWidth: "600px" }}>
        <Card>
          <Card.Body>
            <Card.Title>Already Signed In</Card.Title>
            <Card.Text>
              You are currently logged in as <strong>{currentUser}</strong>.
            </Card.Text>
            <Button variant="primary" onClick={() => navigate("/")}>
              Go to Home
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg("");

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setMsg("Please enter both username and password.");
      return;
    }

    // username rule: at least 5 chars
    if (trimmedUser.length < 5) {
      setMsg("Username must be at least 5 characters long.");
      return;
    }

    // password rule: at least 7 chars
    if (password.length < 7) {
      setMsg("Password must be at least 7 characters long.");
      return;
    }

    const users = loadUsers();

    if (mode === "signup") {
      // confirm password
      if (password !== confirmPw) {
        setMsg("Passwords do not match. Please re-enter them.");
        return;
      }

      // username must be unique
      if (users[trimmedUser]) {
        setMsg("That username is already taken. Please choose another.");
        return;
      }

      // create new user
      users[trimmedUser] = { password };
      saveUsers(users);
      onLogin(trimmedUser);
      navigate("/");
    } else {
      // login mode
      if (!users[trimmedUser] || users[trimmedUser].password !== password) {
        setMsg("Invalid username or password.");
        return;
      }
      onLogin(trimmedUser);
      navigate("/");
    }
  };

  return (
    <Container style={{ padding: "2rem", maxWidth: "600px" }}>
      <Card>
        <Card.Body>
          <Card.Title style={{ marginBottom: "1rem" }}>
            {mode === "login" ? "Log In" : "Sign Up"}
          </Card.Title>

          <ToggleButtonGroup
            type="radio"
            name="mode"
            value={mode}
            style={{ marginBottom: "1rem" }}
          >
            <ToggleButton
              id="mode-login"
              value="login"
              variant={mode === "login" ? "primary" : "outline-primary"}
              onClick={() => setMode("login")}
            >
              I already have an account
            </ToggleButton>
            <ToggleButton
              id="mode-signup"
              value="signup"
              variant={mode === "signup" ? "primary" : "outline-primary"}
              onClick={() => setMode("signup")}
            >
              I’m new here
            </ToggleButton>
          </ToggleButtonGroup>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="badger123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Form.Text muted>
                At least 5 characters. This will identify your saved favorites & schedules.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Form.Text muted>At least 7 characters.</Form.Text>
            </Form.Group>

            {mode === "signup" && (
              <Form.Group className="mb-3" controlId="loginConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </Form.Group>
            )}

            {msg && (
              <div style={{ color: "crimson", marginBottom: "0.75rem" }}>
                {msg}
              </div>
            )}

            <Button type="submit" variant="danger">
              {mode === "login" ? "Log In" : "Create Account"}
            </Button>
          </Form>

        </Card.Body>
      </Card>
    </Container>
  );
}

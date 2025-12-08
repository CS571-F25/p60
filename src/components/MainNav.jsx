// src/components/MainNav.jsx
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function MainNav({ isLoggedIn, currentUser, onLogout }) {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand>Course Planner</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/classes">Classes</Nav.Link>
            <Nav.Link as={Link} to="/favorites">Favorites</Nav.Link>
            <Nav.Link as={Link} to="/quiz">Quiz</Nav.Link>
            <Nav.Link as={Link} to="/schedule">Scheduling</Nav.Link>

            {isLoggedIn ? (
              <>
                <Nav.Link disabled>
                  Signed in as <strong>{currentUser}</strong>
                </Nav.Link>
                <Nav.Link onClick={onLogout}>Sign Out</Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/login">Log In / Sign Up</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

// src/components/MainNav.jsx
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function MainNav() {
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
            <Nav.Link as={Link} to="/login">Log In</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

import { Navbar, Nav, Container, Button, Badge } from "react-bootstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth, dashboardPath } from "../context/AuthContext";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Navbar
      expand="lg"
      bg="dark"
      data-bs-theme="dark"
      sticky="top"
      className="shadow-sm"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-mortarboard-fill me-2"></i>MERN Stack LMS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/courses">
              Courses
            </Nav.Link>
            {user && (
              <Nav.Link as={NavLink} to={dashboardPath(user.role)}>
                Dashboard
              </Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-lg-center gap-2">
            {user ? (
              <>
                <span className="text-light small">
                  <i className="bi bi-person-circle me-1"></i>
                  {user.name}{" "}
                  <Badge bg="info" className="text-capitalize">
                    {user.role}
                  </Badge>
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-light" size="sm">
                  Login
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

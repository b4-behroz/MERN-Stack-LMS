import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container className="text-center small">
        <i className="bi bi-mortarboard-fill me-1"></i> MERN Stack LMS &copy;{" "}
        {new Date().getFullYear()} - Built with React, Node.js, Express &amp;
        MongoDB
      </Container>
    </footer>
  );
}

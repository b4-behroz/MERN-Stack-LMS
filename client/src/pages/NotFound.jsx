import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Container className="text-center py-5">
      <h1 className="display-1 fw-bold">404</h1>
      <p className="lead">Page not found.</p>
      <Button as={Link} to="/">Go Home</Button>
    </Container>
  );
}

import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = await login(form.email, form.password);
      navigate(location.state?.from || dashboardPath(u.role), { replace: true });
    } catch (err) { setError(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h1 className="h3 text-center mb-4">Welcome back</h1>
              {location.state?.msg && <Alert variant="warning">{location.state.msg}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={submit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </Form.Group>
                <Button type="submit" className="w-100" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</Button>
              </Form>
              <p className="text-center mt-3 mb-0 small">No account? <Link to="/register">Register</Link></p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

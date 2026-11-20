import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      const u = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate(dashboardPath(u.role), { replace: true });
    } catch (err) { setError(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={7} lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h1 className="h3 text-center mb-4">Create your account</h1>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={submit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full name</Form.Label>
                  <Form.Control name="name" value={form.name} onChange={change} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={form.email} onChange={change} required />
                </Form.Group>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control type="password" name="password" minLength={6} value={form.password} onChange={change} required />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm</Form.Label>
                      <Form.Control type="password" name="confirm" value={form.confirm} onChange={change} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>I am a</Form.Label>
                  <Form.Select name="role" value={form.role} onChange={change}>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </Form.Select>
                </Form.Group>
                <Button type="submit" className="w-100" disabled={busy}>{busy ? 'Creating...' : 'Register'}</Button>
              </Form>
              <p className="text-center mt-3 mb-0 small">Already registered? <Link to="/login">Login</Link></p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

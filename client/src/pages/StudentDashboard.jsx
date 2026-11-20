import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, ProgressBar, Button, Alert, Form, Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);

  const load = () =>
    api.get('/my-courses').then((r) => setItems(r.data)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggle = async (courseId, lessonId) => {
    try { await api.put(`/my-courses/${courseId}/lessons/${lessonId}`); await load(); }
    catch (e) { setError(errMsg(e)); }
  };

  return (
    <Container className="py-4">
      <h1 className="h2">Welcome, {user.name}</h1>
      <p className="text-muted">Your enrolled courses</p>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {loading ? <Loader /> : items.length === 0 ? (
        <Alert variant="info">You have not enrolled in any course yet. <Link to="/courses">Browse courses</Link></Alert>
      ) : (
        <Row className="g-4">
          {items.map((en) => (
            <Col md={6} key={en._id}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>{en.course.title}</Card.Title>
                  <div className="small text-muted mb-2">By {en.course.instructor?.name}</div>
                  <ProgressBar now={en.progress} label={`${en.progress}%`} className="mb-3" variant={en.progress === 100 ? 'success' : 'primary'} />
                  <Button variant="outline-primary" size="sm" onClick={() => setOpen(open === en._id ? null : en._id)}>
                    {open === en._id ? 'Hide lessons' : `Lessons (${en.course.lessons.length})`}
                  </Button>
                  <Button as={Link} to={`/courses/${en.course._id}`} variant="link" size="sm">Details</Button>
                  <Collapse in={open === en._id}>
                    <div className="mt-3">
                      {en.course.lessons.length === 0 && <span className="text-muted small">No lessons yet.</span>}
                      {en.course.lessons.map((l) => (
                        <Form.Check key={l._id} type="checkbox" id={`${en._id}-${l._id}`} label={l.title}
                          checked={en.completedLessons.includes(l._id)} onChange={() => toggle(en.course._id, l._id)} />
                      ))}
                    </div>
                  </Collapse>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

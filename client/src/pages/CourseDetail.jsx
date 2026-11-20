import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, ListGroup, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    api.get(`/courses/${id}`).then((r) => setCourse(r.data))
      .catch((e) => setMsg({ type: 'danger', text: errMsg(e) })).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'student') {
      api.get('/my-courses').then((r) => setEnrolled(r.data.some((e) => e.course._id === id))).catch(() => {});
    }
  }, [user, id]);

  const enroll = async () => {
    if (!user) return navigate('/login', { state: { from: `/courses/${id}`, msg: 'Please login to enroll' } });
    try {
      await api.post('/enroll', { courseId: id });
      setEnrolled(true);
      setMsg({ type: 'success', text: 'Enrolled successfully! Find it on your dashboard.' });
    } catch (e) { setMsg({ type: 'danger', text: errMsg(e) }); }
  };

  if (loading) return <Loader />;
  if (!course) return <Container className="py-5"><Alert variant="danger">{msg?.text || 'Course not found'}</Alert></Container>;

  return (
    <Container className="py-4">
      <Link to="/courses" className="text-decoration-none"><i className="bi bi-arrow-left"></i> Back to courses</Link>
      {msg && <Alert variant={msg.type} className="mt-3" dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}
      <Row className="mt-3 g-4">
        <Col lg={8}>
          <Badge bg="secondary">{course.category}</Badge>
          <h1 className="h2 mt-2">{course.title}</h1>
          <p className="text-muted"><i className="bi bi-person me-1"></i>By {course.instructor?.name}</p>
          <p>{course.description}</p>
          <h2 className="h5 mt-4">Lessons ({course.lessons.length})</h2>
          {course.lessons.length === 0 ? <p className="text-muted">No lessons uploaded yet.</p> : (
            <ListGroup>
              {course.lessons.map((l, i) => (
                <ListGroup.Item key={l._id}>
                  <strong>{i + 1}. {l.title}</strong>
                  {l.content && <div className="small text-muted">{l.content}</div>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: 80 }}>
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-3">{course.price === 0 ? 'Free' : `$${course.price}`}</div>
              {user && user.role !== 'student' ? (
                <Alert variant="secondary" className="mb-0 small">Only students can enroll.</Alert>
              ) : enrolled ? (
                <Button as={Link} to="/student" variant="success" className="w-100"><i className="bi bi-check-circle me-1"></i>Enrolled - Go to Dashboard</Button>
              ) : (
                <Button className="w-100" onClick={enroll}>Enroll Now</Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

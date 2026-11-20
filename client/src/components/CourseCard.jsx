import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const colors = ['#0d6efd', '#6610f2', '#d63384', '#fd7e14', '#198754', '#20c997', '#0dcaf0'];
const colorFor = (s = '') => colors[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];

export default function CourseCard({ course }) {
  return (
    <Card className="h-100 shadow-sm border-0 course-card">
      <div className="course-thumb rounded-top" style={{ background: colorFor(course.category) }}>
        <i className="bi bi-journal-code"></i>
      </div>
      <Card.Body className="d-flex flex-column">
        <Badge bg="secondary" className="align-self-start mb-2">{course.category}</Badge>
        <Card.Title className="h5">{course.title}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {course.description.length > 90 ? `${course.description.slice(0, 90)}...` : course.description}
        </Card.Text>
        <div className="small text-muted mb-2"><i className="bi bi-person me-1"></i>{course.instructor?.name || 'Instructor'}</div>
        <div className="d-flex justify-content-between align-items-center">
          <strong className="text-primary">{course.price === 0 ? 'Free' : `$${course.price}`}</strong>
          <Button as={Link} to={`/courses/${course._id}`} size="sm" variant="outline-primary">View Details</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

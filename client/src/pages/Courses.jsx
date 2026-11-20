import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Alert } from 'react-bootstrap';
import api, { errMsg } from '../services/api';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api.get('/courses', { params: { search, category } })
        .then((r) => { setCourses(r.data); setError(''); })
        .catch((e) => setError(errMsg(e)))
        .finally(() => setLoading(false));
    }, 300); // debounce typing
    return () => clearTimeout(t);
  }, [search, category]);

  const [allCats, setAllCats] = useState([]);
  useEffect(() => {
    api.get('/courses').then((r) => setAllCats([...new Set(r.data.map((c) => c.category))])).catch(() => {});
  }, []);

  return (
    <Container className="py-4">
      <h1 className="h2 mb-4">All Courses</h1>
      <Row className="g-2 mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
            <Form.Control placeholder="Search courses by title..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {allCats.map((c) => <option key={c}>{c}</option>)}
          </Form.Select>
        </Col>
      </Row>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Loader /> : courses.length === 0 && !error ? (
        <Alert variant="info">No courses found.</Alert>
      ) : (
        <Row className="g-4">{courses.map((c) => <Col sm={6} lg={4} key={c._id}><CourseCard course={c} /></Col>)}</Row>
      )}
    </Container>
  );
}

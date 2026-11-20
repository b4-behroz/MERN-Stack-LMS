import { useEffect, useState } from 'react';
import { Container, Table, Button, Alert, Badge, Modal, Form } from 'react-bootstrap';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CourseFormModal from '../components/CourseFormModal';
import Loader from '../components/Loader';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [lessonFor, setLessonFor] = useState(null);
  const [lesson, setLesson] = useState({ title: '', content: '', videoUrl: '' });

  const load = () =>
    api.get('/courses').then((r) => setCourses(user.role === 'admin' ? r.data : r.data.filter((c) => c.instructor?._id === user._id)))
      .catch((e) => setMsg({ type: 'danger', text: errMsg(e) })).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const saved = (text) => { setMsg({ type: 'success', text }); load(); };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.title}"?`)) return;
    try { await api.delete(`/courses/${c._id}`); saved('Course deleted'); }
    catch (e) { setMsg({ type: 'danger', text: errMsg(e) }); }
  };

  const addLesson = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${lessonFor._id}/lessons`, lesson);
      setLessonFor(null); setLesson({ title: '', content: '', videoUrl: '' });
      saved('Lesson added');
    } catch (err) { setMsg({ type: 'danger', text: errMsg(err) }); }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h2 mb-0">{user.role === 'admin' ? 'All Courses' : 'My Courses'}</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><i className="bi bi-plus-lg me-1"></i>Add Course</Button>
      </div>
      {msg && <Alert variant={msg.type} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}
      {loading ? <Loader /> : courses.length === 0 ? <Alert variant="info">No courses yet. Click "Add Course" to create one.</Alert> : (
        <Table responsive hover className="align-middle bg-white shadow-sm">
          <thead className="table-light">
            <tr><th>Title</th><th>Category</th><th>Price</th><th>Lessons</th><th className="text-end">Actions</th></tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td><Badge bg="secondary">{c.category}</Badge></td>
                <td>{c.price === 0 ? 'Free' : `$${c.price}`}</td>
                <td>{c.lessons.length}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-success" className="me-1" onClick={() => setLessonFor(c)}>+ Lesson</Button>
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => { setEditing(c); setShowForm(true); }}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => remove(c)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <CourseFormModal show={showForm} onHide={() => setShowForm(false)} course={editing} onSaved={saved} />

      <Modal show={!!lessonFor} onHide={() => setLessonFor(null)} centered>
        <Form onSubmit={addLesson}>
          <Modal.Header closeButton><Modal.Title>Add lesson to {lessonFor?.title}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Lesson title</Form.Label>
              <Form.Control value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Content</Form.Label>
              <Form.Control as="textarea" rows={3} value={lesson.content} onChange={(e) => setLesson({ ...lesson, content: e.target.value })} /></Form.Group>
            <Form.Group><Form.Label>Video URL (optional)</Form.Label>
              <Form.Control value={lesson.videoUrl} onChange={(e) => setLesson({ ...lesson, videoUrl: e.target.value })} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button type="submit">Add Lesson</Button></Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

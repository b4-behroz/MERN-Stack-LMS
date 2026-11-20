import { useEffect, useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import api, { errMsg } from '../services/api';

const empty = { title: '', description: '', category: '', price: '' };

// Used for both creating and editing a course
export default function CourseFormModal({ show, onHide, course, onSaved }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(course ? { title: course.title, description: course.description, category: course.category, price: course.price } : empty);
    setError('');
  }, [course, show]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { ...form, price: Number(form.price) };
      if (course) await api.put(`/courses/${course._id}`, payload);
      else await api.post('/courses', payload);
      onSaved(course ? 'Course updated successfully' : 'Course created successfully');
      onHide();
    } catch (err) { setError(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton><Modal.Title>{course ? 'Edit Course' : 'Add New Course'}</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control name="title" value={form.title} onChange={change} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={change} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control name="category" value={form.category} onChange={change} placeholder="e.g. Web Development" required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Price ($)</Form.Label>
            <Form.Control type="number" min="0" step="0.01" name="price" value={form.price} onChange={change} required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save Course'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

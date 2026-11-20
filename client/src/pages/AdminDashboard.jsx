import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Tabs, Tab, Badge } from 'react-bootstrap';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import InstructorDashboard from './InstructorDashboard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [a, u] = await Promise.all([api.get('/admin/analytics'), api.get('/admin/users')]);
      setStats(a.data); setUsers(u.data);
    } catch (e) { setMsg({ type: 'danger', text: errMsg(e) }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    try { await api.put(`/admin/users/${id}`, { role }); setMsg({ type: 'success', text: 'Role updated' }); load(); }
    catch (e) { setMsg({ type: 'danger', text: errMsg(e) }); }
  };
  const remove = async (u) => {
    if (!window.confirm(`Delete user ${u.email}?`)) return;
    try { await api.delete(`/admin/users/${u._id}`); setMsg({ type: 'success', text: 'User deleted' }); load(); }
    catch (e) { setMsg({ type: 'danger', text: errMsg(e) }); }
  };

  if (loading) return <Loader />;

  const cards = stats && [
    { label: 'Users', value: stats.users, icon: 'bi-people', bg: 'primary' },
    { label: 'Courses', value: stats.courses, icon: 'bi-journal-bookmark', bg: 'success' },
    { label: 'Enrollments', value: stats.enrollments, icon: 'bi-clipboard-check', bg: 'warning' },
  ];

  return (
    <Container className="py-4">
      <h1 className="h2 mb-3">Admin Dashboard</h1>
      {msg && <Alert variant={msg.type} dismissible onClose={() => setMsg(null)}>{msg.text}</Alert>}
      <Tabs defaultActiveKey="analytics" className="mb-3">
        <Tab eventKey="analytics" title="Analytics">
          {stats && (
            <>
              <Row className="g-3 mb-4">
                {cards.map((c) => (
                  <Col md={4} key={c.label}>
                    <Card bg={c.bg} text={c.bg === 'warning' ? 'dark' : 'white'} className="shadow-sm">
                      <Card.Body className="d-flex justify-content-between align-items-center">
                        <div><div className="display-6">{c.value}</div>{c.label}</div>
                        <i className={`bi ${c.icon} display-4 opacity-50`}></i>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Row className="g-3">
                <Col md={6}><Card className="shadow-sm"><Card.Header>Users by role</Card.Header>
                  <Card.Body>{stats.byRole.map((r) => <div key={r._id} className="d-flex justify-content-between text-capitalize"><span>{r._id}</span><Badge>{r.count}</Badge></div>)}</Card.Body></Card></Col>
                <Col md={6}><Card className="shadow-sm"><Card.Header>Most popular courses</Card.Header>
                  <Card.Body>{stats.popular.length === 0 ? <span className="text-muted">No enrollments yet</span> : stats.popular.map((p) => <div key={p.title} className="d-flex justify-content-between"><span>{p.title}</span><Badge bg="success">{p.students}</Badge></div>)}</Card.Body></Card></Col>
              </Row>
            </>
          )}
        </Tab>
        <Tab eventKey="users" title="Manage Users">
          <Table responsive hover className="align-middle bg-white shadow-sm">
            <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Role</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td><td>{u.email}</td>
                  <td style={{ maxWidth: 160 }}>
                    <Form.Select size="sm" value={u.role} disabled={u._id === user._id} onChange={(e) => changeRole(u._id, e.target.value)}>
                      <option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option>
                    </Form.Select>
                  </td>
                  <td className="text-end"><Button size="sm" variant="outline-danger" disabled={u._id === user._id} onClick={() => remove(u)}>Delete</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="courses" title="Manage Courses"><InstructorDashboard /></Tab>
      </Tabs>
    </Container>
  );
}

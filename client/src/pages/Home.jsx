import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../services/api";
import CourseCard from "../components/CourseCard";
import Loader from "../components/Loader";

const features = [
  {
    icon: "bi-collection-play",
    title: "Learn Anywhere",
    text: "Browse courses and study at your own pace.",
  },
  {
    icon: "bi-person-workspace",
    title: "Expert Instructors",
    text: "Instructors create and manage their own courses.",
  },
  {
    icon: "bi-graph-up-arrow",
    title: "Track Progress",
    text: "See your progress for every enrolled course.",
  },
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/courses")
      .then((r) => setCourses(r.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero text-white py-5">
        <Container className="py-5 text-center">
          <h1 className="display-4 fw-bold">
            Learn new skills with MERN Stack LMS
          </h1>
          <p className="lead mb-4">
            A simple learning management system where students enroll in courses
            and instructors manage them.
          </p>
          <Button
            as={Link}
            to="/courses"
            size="lg"
            variant="light"
            className="me-2"
          >
            Browse Courses
          </Button>
          <Button as={Link} to="/register" size="lg" variant="outline-light">
            Get Started
          </Button>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="g-4 text-center">
          {features.map((f) => (
            <Col md={4} key={f.title}>
              <Card className="h-100 border-0 shadow-sm p-3">
                <i className={`bi ${f.icon} display-5 text-primary`}></i>
                <h5 className="mt-3">{f.title}</h5>
                <p className="text-muted mb-0">{f.text}</p>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
          <h2 className="h3 mb-0">Latest Courses</h2>
          <Link to="/courses">View all</Link>
        </div>
        {loading ? (
          <Loader />
        ) : courses.length === 0 ? (
          <p className="text-muted">No courses yet.</p>
        ) : (
          <Row className="g-4">
            {courses.map((c) => (
              <Col md={4} key={c._id}>
                <CourseCard course={c} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
}

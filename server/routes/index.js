const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const auth = require('../controllers/authController');
const course = require('../controllers/courseController');
const enr = require('../controllers/enrollmentController');
const admin = require('../controllers/adminController');

// Auth
router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', protect, auth.me);

// Courses
router.get('/courses', course.getCourses);
router.get('/courses/:id', course.getCourse);
router.post('/courses', protect, authorize('instructor', 'admin'), course.createCourse);
router.put('/courses/:id', protect, authorize('instructor', 'admin'), course.updateCourse);
router.delete('/courses/:id', protect, authorize('instructor', 'admin'), course.deleteCourse);
router.post('/courses/:id/lessons', protect, authorize('instructor', 'admin'), course.addLesson);
router.delete('/courses/:id/lessons/:lessonId', protect, authorize('instructor', 'admin'), course.deleteLesson);

// Enrollment (students)
router.post('/enroll', protect, authorize('student'), enr.enroll);
router.get('/my-courses', protect, authorize('student'), enr.myCourses);
router.put('/my-courses/:courseId/lessons/:lessonId', protect, authorize('student'), enr.toggleLesson);

// Admin
router.get('/admin/users', protect, authorize('admin'), admin.getUsers);
router.put('/admin/users/:id', protect, authorize('admin'), admin.updateUserRole);
router.delete('/admin/users/:id', protect, authorize('admin'), admin.deleteUser);
router.get('/admin/analytics', protect, authorize('admin'), admin.analytics);

module.exports = router;

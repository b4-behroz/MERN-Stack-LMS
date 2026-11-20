const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// POST /api/enroll  { courseId }
exports.enroll = async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const exists = await Enrollment.findOne({ student: req.user._id, course: course._id });
    if (exists) return res.status(400).json({ message: 'You are already enrolled in this course' });
    const enrollment = await Enrollment.create({ student: req.user._id, course: course._id });
    res.status(201).json(enrollment);
  } catch (err) { next(err); }
};

// GET /api/my-courses
exports.myCourses = async (req, res, next) => {
  try {
    const list = await Enrollment.find({ student: req.user._id })
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } })
      .sort('-createdAt');
    res.json(list.filter((e) => e.course));
  } catch (err) { next(err); }
};

// PUT /api/my-courses/:courseId/lessons/:lessonId -> toggle lesson completion, recalc progress
exports.toggleLesson = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    if (!enrollment) return res.status(404).json({ message: 'You are not enrolled in this course' });
    const course = await Course.findById(req.params.courseId);
    const lessonId = req.params.lessonId;
    if (!course.lessons.id(lessonId)) return res.status(404).json({ message: 'Lesson not found' });

    const done = enrollment.completedLessons.map(String);
    enrollment.completedLessons = done.includes(lessonId)
      ? enrollment.completedLessons.filter((l) => String(l) !== lessonId)
      : [...enrollment.completedLessons, lessonId];
    enrollment.progress = course.lessons.length
      ? Math.round((enrollment.completedLessons.length / course.lessons.length) * 100)
      : 0;
    await enrollment.save();
    res.json(enrollment);
  } catch (err) { next(err); }
};

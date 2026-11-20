require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Course = require("./models/Course");
const Enrollment = require("./models/Enrollment");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    User.deleteMany(),
    Course.deleteMany(),
    Enrollment.deleteMany(),
  ]);

  await User.create({
    name: "Admin User",
    email: "admin@mslms.com",
    password: "admin123",
    role: "admin",
  });
  const instructor = await User.create({
    name: "Ayesha Khan",
    email: "instructor@mslms.com",
    password: "instructor123",
    role: "instructor",
  });
  await User.create({
    name: "Ali Raza",
    email: "student@mslms.com",
    password: "student123",
    role: "student",
  });

  const lessons = (t) => [
    { title: `${t}: Introduction`, content: "Course overview and setup." },
    { title: `${t}: Core Concepts`, content: "The fundamentals you need." },
    { title: `${t}: Build a Project`, content: "Hands-on practice." },
  ];
  await Course.insertMany([
    {
      title: "React for Beginners",
      category: "Web Development",
      price: 49,
      instructor: instructor._id,
      description:
        "Learn components, props, state and hooks by building real UIs.",
      lessons: lessons("React"),
    },
    {
      title: "Node.js & Express APIs",
      category: "Backend",
      price: 59,
      instructor: instructor._id,
      description: "Build secure REST APIs with Express, Mongoose and JWT.",
      lessons: lessons("Node"),
    },
    {
      title: "MongoDB Essentials",
      category: "Database",
      price: 39,
      instructor: instructor._id,
      description: "Model data, write queries and use aggregation pipelines.",
      lessons: lessons("Mongo"),
    },
    {
      title: "UI Design with Bootstrap",
      category: "Design",
      price: 0,
      instructor: instructor._id,
      description:
        "Create responsive layouts with the Bootstrap grid and components.",
      lessons: lessons("Bootstrap"),
    },
  ]);
  console.log(
    "Seeded. Logins: admin@mslms.com/admin123, instructor@mslms.com/instructor123, student@mslms.com/student123",
  );
  process.exit(0);
})();

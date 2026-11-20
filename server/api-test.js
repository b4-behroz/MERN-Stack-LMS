const fs = require("fs");
const BASE = process.env.API_URL || "http://localhost:5000/api";
const results = [];
const log = [];

async function call(name, method, path, { token, body, expect }) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  const pass = res.status === expect;
  results.push({ name, method, path, expect, status: res.status, pass });
  const shown = JSON.stringify(
    data,
    (k, v) => (k === "token" && v ? v.slice(0, 25) + "..." : v),
    2,
  );
  const short =
    shown && shown.length > 700
      ? shown.slice(0, 700) + "\n  ...(truncated)"
      : shown;
  log.push(
    `### ${results.length}. ${name}\n\`${method} ${path}\`  -> expected **${expect}**, got **${res.status}** ${pass ? "PASS" : "FAIL"}\n\n\`\`\`json\n${short}\n\`\`\`\n`,
  );
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${String(res.status).padEnd(4)} ${method.padEnd(6)} ${path.padEnd(42)} ${name}`,
  );
  return data;
}

(async () => {
  const stamp = Date.now();
  const email = `tester${stamp}@example.com`;

  await call("Health check", "GET", "/health", { expect: 200 });

  // Auth
  const reg = await call("Register student", "POST", "/register", {
    body: { name: "Test Student", email, password: "test123", role: "student" },
    expect: 201,
  });
  await call("Register duplicate email", "POST", "/register", {
    body: { name: "Dup", email, password: "test123" },
    expect: 400,
  });
  await call("Register invalid data", "POST", "/register", {
    body: { email: "bad", password: "1" },
    expect: 400,
  });
  await call("Register tries role=admin (downgraded)", "POST", "/register", {
    body: {
      name: "Sneaky",
      email: `sneaky${stamp}@example.com`,
      password: "test123",
      role: "admin",
    },
    expect: 201,
  });
  await call("Login wrong password", "POST", "/login", {
    body: { email, password: "wrong" },
    expect: 401,
  });
  const stu = await call("Login student", "POST", "/login", {
    body: { email, password: "test123" },
    expect: 200,
  });
  const ins = await call("Login instructor", "POST", "/login", {
    body: { email: "instructor@mslms.com", password: "instructor123" },
    expect: 200,
  });
  const adm = await call("Login admin", "POST", "/login", {
    body: { email: "admin@mslms.com", password: "admin123" },
    expect: 200,
  });
  const S = stu?.token,
    I = ins?.token,
    A = adm?.token;
  await call("Get current user (/me)", "GET", "/me", { token: S, expect: 200 });

  // Courses
  await call("List courses (public)", "GET", "/courses", { expect: 200 });
  await call("Search courses", "GET", "/courses?search=react", { expect: 200 });
  await call("Create course - no token", "POST", "/courses", {
    body: {},
    expect: 401,
  });
  await call("Create course - student forbidden", "POST", "/courses", {
    token: S,
    body: { title: "x", description: "x", category: "x", price: 1 },
    expect: 403,
  });
  await call("Create course - validation error", "POST", "/courses", {
    token: I,
    body: { title: "Only title" },
    expect: 400,
  });
  const course = await call("Create course (instructor)", "POST", "/courses", {
    token: I,
    body: {
      title: "Git Basics",
      description: "Learn version control",
      category: "Tools",
      price: 19,
    },
    expect: 201,
  });
  const cid = course?._id;
  await call("Get single course", "GET", `/courses/${cid}`, { expect: 200 });
  await call("Get course - invalid id", "GET", "/courses/123", { expect: 400 });
  await call("Update course", "PUT", `/courses/${cid}`, {
    token: I,
    body: { price: 29 },
    expect: 200,
  });
  const withLesson = await call(
    "Add lesson",
    "POST",
    `/courses/${cid}/lessons`,
    {
      token: I,
      body: { title: "Lesson 1: Intro", content: "What is Git?" },
      expect: 201,
    },
  );
  const lid = withLesson?.lessons?.[0]?._id;

  // Enrollment
  await call("Enroll - instructor forbidden", "POST", "/enroll", {
    token: I,
    body: { courseId: cid },
    expect: 403,
  });
  await call("Enroll student", "POST", "/enroll", {
    token: S,
    body: { courseId: cid },
    expect: 201,
  });
  await call("Enroll again (duplicate)", "POST", "/enroll", {
    token: S,
    body: { courseId: cid },
    expect: 400,
  });
  await call("My courses", "GET", "/my-courses", { token: S, expect: 200 });
  await call(
    "Complete lesson (progress -> 100%)",
    "PUT",
    `/my-courses/${cid}/lessons/${lid}`,
    { token: S, expect: 200 },
  );
  await call("My courses without token", "GET", "/my-courses", { expect: 401 });

  // Admin
  await call("Admin analytics - student forbidden", "GET", "/admin/analytics", {
    token: S,
    expect: 403,
  });
  await call("Admin analytics", "GET", "/admin/analytics", {
    token: A,
    expect: 200,
  });
  const users = await call("Admin list users", "GET", "/admin/users", {
    token: A,
    expect: 200,
  });
  const target = users?.find((u) => u.email === email);
  await call("Admin change user role", "PUT", `/admin/users/${target?._id}`, {
    token: A,
    body: { role: "instructor" },
    expect: 200,
  });
  await call("Admin delete user", "DELETE", `/admin/users/${target?._id}`, {
    token: A,
    expect: 200,
  });

  // Cleanup
  await call("Delete course", "DELETE", `/courses/${cid}`, {
    token: I,
    expect: 200,
  });
  await call("Unknown route", "GET", "/nothing", { expect: 404 });

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} tests passed`);

  const table =
    "| # | Test | Request | Expected | Actual | Result |\n|---|---|---|---|---|---|\n" +
    results
      .map(
        (r, i) =>
          `| ${i + 1} | ${r.name} | \`${r.method} ${r.path}\` | ${r.expect} | ${r.status} | ${r.pass ? "PASS" : "FAIL"} |`,
      )
      .join("\n");
  fs.writeFileSync(
    "api-test-report.md",
    `# MERN Stack LMS API Testing Report\n\nBase URL: ${BASE}\nDate: ${new Date().toISOString()}\n\n**Summary: ${passed}/${results.length} tests passed**\n\n${table}\n\n## Request and response details\n\n${log.join("\n")}`,
  );
  console.log("Saved api-test-report.md");
  process.exit(passed === results.length ? 0 : 1);
})();

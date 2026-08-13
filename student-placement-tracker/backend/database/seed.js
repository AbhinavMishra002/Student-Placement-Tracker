// database/seed.js
// Populates the database with realistic sample data so the app
// looks complete the moment it's opened. Run with: npm run seed

const db = require("./db");

function clearAll() {
  db.exec(`
    DELETE FROM placements;
    DELETE FROM interviews;
    DELETE FROM applications;
    DELETE FROM companies;
    DELETE FROM students;
  `);
}

function seed() {
  clearAll();

  const insertStudent = db.prepare(`
    INSERT INTO students (name, roll_number, branch, cgpa, skills, email, phone, placement_status)
    VALUES (@name, @roll_number, @branch, @cgpa, @skills, @email, @phone, @placement_status)
  `);

  const students = [
    { name: "Aarav Sharma", roll_number: "BCA21-001", branch: "BCA", cgpa: 8.7, skills: "React, Node.js, SQL", email: "aarav.sharma@college.edu", phone: "9876500001", placement_status: "Placed" },
    { name: "Priya Nair", roll_number: "BCA21-002", branch: "BCA", cgpa: 9.1, skills: "Java, Spring Boot, MySQL", email: "priya.nair@college.edu", phone: "9876500002", placement_status: "Placed" },
    { name: "Rohan Verma", roll_number: "BCA21-003", branch: "BCA", cgpa: 7.4, skills: "Python, Django, Pandas", email: "rohan.verma@college.edu", phone: "9876500003", placement_status: "In Process" },
    { name: "Sneha Iyer", roll_number: "BCA21-004", branch: "BCA", cgpa: 8.2, skills: "Salesforce Admin, Apex, LWC", email: "sneha.iyer@college.edu", phone: "9876500004", placement_status: "In Process" },
    { name: "Karan Mehta", roll_number: "BCA21-005", branch: "BCA", cgpa: 6.9, skills: "C++, DSA", email: "karan.mehta@college.edu", phone: "9876500005", placement_status: "Not Placed" },
    { name: "Ananya Reddy", roll_number: "BCA21-006", branch: "BCA", cgpa: 9.4, skills: "React, Salesforce, Apex, LWC", email: "ananya.reddy@college.edu", phone: "9876500006", placement_status: "Placed" },
    { name: "Vikram Singh", roll_number: "BCA21-007", branch: "BCA", cgpa: 7.8, skills: "JavaScript, MongoDB, Express", email: "vikram.singh@college.edu", phone: "9876500007", placement_status: "Not Placed" },
    { name: "Ishita Gupta", roll_number: "BCA21-008", branch: "BCA", cgpa: 8.9, skills: "Python, ML, SQL", email: "ishita.gupta@college.edu", phone: "9876500008", placement_status: "In Process" },
  ];

  const studentIds = students.map((s) => insertStudent.run(s).lastInsertRowid);

  const insertCompany = db.prepare(`
    INSERT INTO companies (name, industry, job_role, package_ctc, eligibility_criteria, required_skills, drive_date)
    VALUES (@name, @industry, @job_role, @package_ctc, @eligibility_criteria, @required_skills, @drive_date)
  `);

  const companies = [
    { name: "Salescloud Technologies", industry: "IT Services", job_role: "Salesforce Developer", package_ctc: 6.5, eligibility_criteria: "CGPA >= 7.0, No active backlogs", required_skills: "Apex, LWC, SOQL", drive_date: "2026-02-10" },
    { name: "NimbusWorks", industry: "SaaS", job_role: "Frontend Engineer", package_ctc: 7.2, eligibility_criteria: "CGPA >= 7.5", required_skills: "React, JavaScript, CSS", drive_date: "2026-02-15" },
    { name: "DataForge Analytics", industry: "Data & Analytics", job_role: "Data Analyst", package_ctc: 5.8, eligibility_criteria: "CGPA >= 7.0", required_skills: "Python, SQL, Pandas", drive_date: "2026-02-20" },
    { name: "Corewave Systems", industry: "Enterprise Software", job_role: "Backend Developer", package_ctc: 8.0, eligibility_criteria: "CGPA >= 8.0", required_skills: "Java, Spring Boot, MySQL", drive_date: "2026-03-01" },
    { name: "BrightPath Consulting", industry: "IT Consulting", job_role: "Associate Software Engineer", package_ctc: 6.0, eligibility_criteria: "CGPA >= 6.5", required_skills: "JavaScript, Node.js", drive_date: "2026-03-05" },
  ];

  const companyIds = companies.map((c) => insertCompany.run(c).lastInsertRowid);

  const insertApplication = db.prepare(`
    INSERT INTO applications (student_id, company_id, application_date, status, resume_submitted)
    VALUES (@student_id, @company_id, @application_date, @status, @resume_submitted)
  `);

  const applications = [
    { student_id: studentIds[0], company_id: companyIds[1], application_date: "2026-02-16", status: "Offered", resume_submitted: 1 },
    { student_id: studentIds[1], company_id: companyIds[3], application_date: "2026-03-02", status: "Offered", resume_submitted: 1 },
    { student_id: studentIds[2], company_id: companyIds[2], application_date: "2026-02-21", status: "Interviewing", resume_submitted: 1 },
    { student_id: studentIds[3], company_id: companyIds[0], application_date: "2026-02-11", status: "Interviewing", resume_submitted: 1 },
    { student_id: studentIds[4], company_id: companyIds[4], application_date: "2026-03-06", status: "Rejected", resume_submitted: 1 },
    { student_id: studentIds[5], company_id: companyIds[0], application_date: "2026-02-11", status: "Offered", resume_submitted: 1 },
    { student_id: studentIds[6], company_id: companyIds[1], application_date: "2026-02-16", status: "Rejected", resume_submitted: 1 },
    { student_id: studentIds[7], company_id: companyIds[2], application_date: "2026-02-21", status: "Shortlisted", resume_submitted: 1 },
    { student_id: studentIds[3], company_id: companyIds[3], application_date: "2026-03-03", status: "Applied", resume_submitted: 1 },
    { student_id: studentIds[2], company_id: companyIds[4], application_date: "2026-03-07", status: "Applied", resume_submitted: 0 },
  ];

  const applicationIds = applications.map((a) => insertApplication.run(a).lastInsertRowid);

  const insertInterview = db.prepare(`
    INSERT INTO interviews (application_id, round, interview_date, result, feedback, interviewer)
    VALUES (@application_id, @round, @interview_date, @result, @feedback, @interviewer)
  `);

  const interviews = [
    { application_id: applicationIds[0], round: "Technical Round 1", interview_date: "2026-02-18", result: "Pass", feedback: "Strong React fundamentals.", interviewer: "M. Kapoor" },
    { application_id: applicationIds[0], round: "HR Round", interview_date: "2026-02-20", result: "Pass", feedback: "Good communication, culture fit.", interviewer: "S. Rao" },
    { application_id: applicationIds[1], round: "Technical Round 1", interview_date: "2026-03-04", result: "Pass", feedback: "Solid backend design knowledge.", interviewer: "A. Khan" },
    { application_id: applicationIds[1], round: "HR Round", interview_date: "2026-03-06", result: "Pass", feedback: "Confident and clear.", interviewer: "T. Fernandes" },
    { application_id: applicationIds[2], round: "Technical Round 1", interview_date: "2026-02-24", result: "Pending", feedback: "", interviewer: "R. Das" },
    { application_id: applicationIds[3], round: "Technical Round 1", interview_date: "2026-02-14", result: "Pass", feedback: "Good Apex trigger logic.", interviewer: "N. Bose" },
    { application_id: applicationIds[3], round: "Technical Round 2", interview_date: "2026-02-19", result: "Pending", feedback: "", interviewer: "N. Bose" },
    { application_id: applicationIds[4], round: "Technical Round 1", interview_date: "2026-03-09", result: "Fail", feedback: "Weak in problem solving.", interviewer: "P. Menon" },
    { application_id: applicationIds[5], round: "Technical Round 1", interview_date: "2026-02-14", result: "Pass", feedback: "Excellent LWC project shown.", interviewer: "N. Bose" },
    { application_id: applicationIds[5], round: "HR Round", interview_date: "2026-02-17", result: "Pass", feedback: "Great fit.", interviewer: "S. Rao" },
    { application_id: applicationIds[6], round: "Technical Round 1", interview_date: "2026-02-19", result: "Fail", feedback: "Needs stronger JS fundamentals.", interviewer: "A. Khan" },
    { application_id: applicationIds[7], round: "Technical Round 1", interview_date: "2026-02-25", result: "Pending", feedback: "", interviewer: "R. Das" },
  ];

  interviews.forEach((i) => insertInterview.run(i));

  const insertPlacement = db.prepare(`
    INSERT INTO placements (application_id, offer_status, selected_company, final_package, joining_date, placement_confirmed)
    VALUES (@application_id, @offer_status, @selected_company, @final_package, @joining_date, @placement_confirmed)
  `);

  const placements = [
    { application_id: applicationIds[0], offer_status: "Accepted", selected_company: "NimbusWorks", final_package: 7.2, joining_date: "2026-06-01", placement_confirmed: 1 },
    { application_id: applicationIds[1], offer_status: "Accepted", selected_company: "Corewave Systems", final_package: 8.0, joining_date: "2026-06-15", placement_confirmed: 1 },
    { application_id: applicationIds[5], offer_status: "Accepted", selected_company: "Salescloud Technologies", final_package: 6.5, joining_date: "2026-06-01", placement_confirmed: 1 },
  ];

  placements.forEach((p) => insertPlacement.run(p));

  console.log("✅ Database seeded successfully:");
  console.log(`   Students: ${students.length}`);
  console.log(`   Companies: ${companies.length}`);
  console.log(`   Applications: ${applications.length}`);
  console.log(`   Interviews: ${interviews.length}`);
  console.log(`   Placements: ${placements.length}`);
}

seed();

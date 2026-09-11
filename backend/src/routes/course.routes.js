import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { Course } from '../models/Course.js';
import { CourseEnrollment } from '../models/CourseEnrollment.js';
import { NoteRequest } from '../models/NoteRequest.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';
import { authRequired, requireRoles } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const [upcoming, archived] = await Promise.all([
    Course.find({ archived: false }).sort({ createdAt: -1 }),
    Course.find({ archived: true }).sort({ createdAt: -1 })
  ]);
  res.json({ ok: true, upcoming, archived });
}));

router.post('/:slug/enroll', publicFormLimiter, asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  if (!course) throw new HttpError(404, 'Course not found.');
  const { fullName, email, departmentSemester } = req.body || {};
  if (!fullName || !email || !departmentSemester) throw new HttpError(400, 'All enrollment fields are required.');
  try {
    await CourseEnrollment.create({ course: course._id, fullName, email, departmentSemester });
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, 'You are already enrolled in this course.');
    throw err;
  }
  await sendMail({
    to: email,
    subject: `Enrolled: ${course.title}`,
    html: wrapEmail('Enrollment confirmed', `<p>Assalamu alaikum ${fullName},</p><p>You are enrolled in <strong>${course.title}</strong>.</p><p>Schedule: ${course.schedule || course.duration}</p>`)
  });
  res.status(201).json({ ok: true });
}));

router.post('/:slug/notes-request', publicFormLimiter, asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  if (!course) throw new HttpError(404, 'Course not found.');
  const doc = await NoteRequest.create({
    course: course._id,
    courseTitle: course.title,
    email: req.body?.email || '',
    name: req.body?.name || ''
  });
  await notifyCommittee(
    `Notes request: ${course.title}`,
    wrapEmail('Notes request', `<p>${doc.name || 'A student'} requested slides for ${course.title} (${doc.email || 'no email'}).</p>`)
  );
  res.status(201).json({ ok: true });
}));

router.post('/', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ ok: true, course });
}));

router.patch('/:id', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) throw new HttpError(404, 'Course not found.');
  res.json({ ok: true, course });
}));

export default router;

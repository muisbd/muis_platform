import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { WeeklyProgram } from '../models/WeeklyProgram.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { Course } from '../models/Course.js';
import { MagazineEdition } from '../models/MagazineEdition.js';
import { CommitteeMember } from '../models/CommitteeMember.js';
import { FaqItem } from '../models/FaqItem.js';
import { EVENTS, WEEKLY, GALLERY, COURSES, MAGAZINE, COMMITTEE, FAQS } from './siteData.js';

async function upsertMany(Model, items, key) {
  for (const item of items) {
    await Model.findOneAndUpdate({ [key]: item[key] }, item, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
}

async function run() {
  await connectDb();

  if (env.adminEmail && env.adminPassword) {
    const existing = await User.findOne({ email: env.adminEmail.toLowerCase() });
    if (!existing) {
      await User.create({
        name: env.adminName,
        email: env.adminEmail,
        password: env.adminPassword,
        studentId: env.adminStudentId,
        role: 'admin'
      });
      console.log('Admin user created:', env.adminEmail);
    } else {
      existing.role = 'admin';
      existing.name = env.adminName || existing.name;
      if (env.adminPassword.length >= 6) {
        existing.password = env.adminPassword;
      }
      await existing.save();
      console.log('Admin user updated:', env.adminEmail);
    }
  } else {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user.');
  }

  await upsertMany(Event, EVENTS, 'slug');
  console.log(`Events: ${EVENTS.length}`);

  const weeklyCount = await WeeklyProgram.countDocuments();
  if (weeklyCount === 0) {
    await WeeklyProgram.insertMany(WEEKLY);
  }
  console.log('Weekly programs ready');

  const galleryCount = await GalleryItem.countDocuments();
  if (galleryCount === 0) {
    await GalleryItem.insertMany(GALLERY);
  }
  console.log('Gallery ready');

  await upsertMany(Course, COURSES, 'slug');
  console.log(`Courses: ${COURSES.length}`);

  await upsertMany(MagazineEdition, MAGAZINE, 'slug');
  console.log(`Magazine editions: ${MAGAZINE.length}`);

  for (const member of COMMITTEE) {
    await CommitteeMember.findOneAndUpdate({ name: member.name, role: member.role }, member, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  console.log(`Committee: ${COMMITTEE.length}`);

  for (const faq of FAQS) {
    await FaqItem.findOneAndUpdate({ question: faq.question }, faq, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  console.log(`FAQs: ${FAQS.length}`);

  console.log('Seed complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

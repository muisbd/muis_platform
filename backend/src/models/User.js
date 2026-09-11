import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    studentId: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    gender: { type: String, enum: ['Male', 'Female', ''], default: '' },
    role: {
      type: String,
      enum: ['student', 'blogger', 'moderator', 'treasurer', 'admin'],
      default: 'student'
    },
    bloggerId: { type: String, default: '' },
    frozen: { type: Boolean, default: false },
    byline: { type: String, default: '' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model('User', userSchema);

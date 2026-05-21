import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../../config';
import type { TUser } from './user.interface';

const userSchema = new Schema<TUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);


userSchema.pre('save', async function (next) {
  const user = this; 

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds)
    );
  }
  
});

export const User = model<TUser>('User', userSchema);
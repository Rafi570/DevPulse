import { Model } from 'mongoose';

export type TUser = {
  username: string;
  password: string;
  role: 'admin';
  email?: string;
  resetToken?: string | null; 
  resetTokenExpiry?: Date | null; 
};

export interface UserModel extends Model<TUser> {
  isUserExists(username: string): Promise<TUser | null>;
}
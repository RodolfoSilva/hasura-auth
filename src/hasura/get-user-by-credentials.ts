import bcrypt from 'bcryptjs';
import { User } from './user-type';
import { getUserByEmail } from './get-user-by-email';

export const getUserByCredentials = async (
  email: string,
  password: string,
): Promise<User> => {
  const user: User | undefined = await getUserByEmail(email);

  if (!user) {
    throw new Error('Invalid "email" or "password"');
  }

  if (!user.is_active) {
    throw new Error('User not activated.');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error('Invalid "email" or "password"');
  }

  return user;
};

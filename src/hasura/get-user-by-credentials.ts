import bcrypt from 'bcryptjs';
import { User } from './user-type';
import { getUserByOrganizationIdAndEmail } from './get-user-by-organization-id-email';

export const getUserByCredentials = async (
  organizationId: string | null,
  id: string | null,
  email: string,
  password: string,
): Promise<User> => {
  const user: User | undefined = await getUserByOrganizationIdAndEmail(
    organizationId,
    id,
    email,
  );

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

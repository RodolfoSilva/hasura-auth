import uuidv4 from 'uuid/v4';
import bcrypt from 'bcryptjs';
import { updateUser } from './update-user';
import { User } from './user-type';

export const changeUserPassword = async (
  user: User,
  newPassword: string,
): Promise<boolean> => {
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  const result = await updateUser(
    {
      id: { _eq: user.id },
    },
    {
      password: newPasswordHash,
      secret_token: uuidv4(),
    },
  );

  if (result.affected_rows === 0) {
    throw new Error('Unable to update "password"');
  }

  return true;
};

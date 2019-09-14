import uuidv4 from 'uuid/v4';
import { updateUser } from './update-user';

export const activateUser = async (
  organizationId: string | null,
  email: string,
  secretToken: string,
): Promise<boolean> => {
  const result = await updateUser(
    {
      email: { _eq: email },
      organization_id: { _eq: organizationId },
      secret_token: { _eq: secretToken },
      is_active: { _eq: false },
    },
    {
      is_active: true,
      secret_token: uuidv4(),
    },
  );

  if (result.affected_rows === 0) {
    throw new Error('Account is already activated or there is no account.');
  }

  return true;
};

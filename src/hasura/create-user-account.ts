import bcrypt from 'bcryptjs';
import gql from 'graphql-tag';
import { userRegistrationAutoActive } from '../vars';
import { hasuraQuery } from './client';
import { USER_FRAGMENT } from './user-fragment';
import { User } from './user-type';

export const createUserAccount = async (
  organizationId: string | null,
  email: string,
  password: string,
): Promise<User> => {
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await hasuraQuery(
    gql`
      ${USER_FRAGMENT}
      mutation($user: user_insert_input!) {
        insert_user(objects: [$user]) {
          returning {
            ...UserParts
          }
        }
      }
    `,
    {
      user: {
        email: email.toLowerCase(),
        password: passwordHash,
        organization_id: organizationId,
        is_active: userRegistrationAutoActive,
      },
    },
  );

  return result?.data?.insert_user?.returning?.[0] as User;
};

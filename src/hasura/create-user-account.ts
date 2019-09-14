import bcrypt from 'bcryptjs';
import uuidv4 from 'uuid/v4';
import getIn from 'lodash/get';
import gql from 'graphql-tag';
import { hasuraQuery } from './client';
import { USER_FRAGMENT } from './user-fragment';
import { User } from './user-type';
import { getUserByOrganizationIdAndEmail } from './get-user-by-organization-id-email';
import { userRegistrationAutoActive } from '../vars';

export const createUserAccount = async (
  organizationId: string | null,
  email: string,
  password: string,
): Promise<User> => {
  const user: User | undefined = await getUserByOrganizationIdAndEmail(
    organizationId,
    email,
  );

  if (user) {
    throw new Error('Email already registered');
  }

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
        secret_token: uuidv4(),
        organization_id: organizationId,
        is_active: userRegistrationAutoActive,
      },
    },
  );

  return getIn(result, 'data.insert_user.returning') as User;
};

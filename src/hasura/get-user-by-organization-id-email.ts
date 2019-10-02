import gql from 'graphql-tag';
import getIn from 'lodash/get';
import { hasuraQuery } from './client';
import { User } from './user-type';
import { USER_FRAGMENT } from './user-fragment';

export const getUserByOrganizationIdAndEmail = async (
  organizationId: string | null,
  id: string | null,
  email: string,
): Promise<User | undefined> => {
  try {
    const response = await hasuraQuery(
      gql`
        ${USER_FRAGMENT}
        query($where: user_bool_exp) {
          user(where: $where) {
            ...UserParts
          }
        }
      `,
      {
        where: {
          organization_id: { _eq: organizationId },
          id: { _eq: id },
          email: { _eq: email.toLowerCase() },
        },
      },
    );

    return getIn(response, 'data.user[0]');
  } catch (e) {
    throw new Error('Unable to find the email');
  }
};

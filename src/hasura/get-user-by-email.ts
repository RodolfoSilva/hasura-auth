import gql from 'graphql-tag';
import getIn from 'lodash/get';
import { hasuraQuery } from './client';
import { User } from './user-type';
import { USER_FRAGMENT } from './user-fragment';

export const getUserByEmail = async (
  email: string,
): Promise<User | undefined> => {
  try {
    const response = await hasuraQuery(
      gql`
        ${USER_FRAGMENT}
        query($where: users_bool_exp) {
          users(where: $where) {
            ...UserParts
          }
        }
      `,
      {
        where: {
          email: { _eq: email },
        },
      },
    );

    return getIn(response, 'data.users[0]');
  } catch (e) {
    throw new Error('Unable to find the email');
  }
};

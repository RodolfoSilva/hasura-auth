import getIn from 'lodash/get';
import gql from 'graphql-tag';
import { hasuraQuery } from './client';
import { User } from './user-type';
import { USER_FRAGMENT } from './user-fragment';

export const getUserByIdAndRefreshToken = async (
  id: string,
  refreshToken: string,
): Promise<User> => {
  const result = await hasuraQuery(
    gql`
      ${USER_FRAGMENT}
      query($where: user_session_bool_exp) {
        user_session(where: $where) {
          user {
            ...UserParts
          }
        }
      }
    `,
    {
      where: {
        user_id: { _eq: id },
        user: { is_active: { _eq: true } },
        refresh_token: { _eq: refreshToken },
        expires_at: { _gte: new Date() },
      },
    },
  );

  const user: User = getIn(result, 'data.user_session[0].user');

  if (user === null || user === undefined) {
    throw new Error("Invalid 'refresh_token' or 'user_id'");
  }

  return user;
};

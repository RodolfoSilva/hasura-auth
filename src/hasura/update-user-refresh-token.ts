import uuidv4 from 'uuid/v4';
import getIn from 'lodash/get';
import gql from 'graphql-tag';
import { hasuraQuery } from './client';
import { User } from './user-type';
import { getExpiresDate } from './get-expires-date';

export const updateUserRefreshToken = async (
  user: User,
  refreshToken: string,
): Promise<User> => {
  const newRefreshToken = uuidv4();
  const expiresAt = getExpiresDate();

  const result = await hasuraQuery(
    gql`
      mutation(
        $where: user_session_bool_exp!
        $set: user_session_insert_input!
      ) {
        delete_user_session(where: $where) {
          affected_rows
        }
        insert_user_session(objects: [$set]) {
          affected_rows
        }
      }
    `,
    {
      where: {
        _or: [
          {
            expires_at: { _lte: new Date() },
          },
          {
            user_id: { _eq: user.id },
            refresh_token: { _eq: refreshToken },
          },
        ],
      },
      set: {
        user_id: user.id,
        refresh_token: newRefreshToken,
        expires_at: expiresAt,
      },
    },
  );

  if (
    getIn(result, 'data.delete_user_session.affected_rows', 0) === 0 ||
    getIn(result, 'data.insert_user_session.affected_rows', 0) === 0
  ) {
    return Promise.reject(new Error('Error to update the refresh token'));
  }

  return newRefreshToken;
};

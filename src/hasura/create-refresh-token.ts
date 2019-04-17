import uuidv4 from 'uuid/v4';
import getIn from 'lodash/get';
import gql from 'graphql-tag';
import { hasuraQuery } from './client';
import { User } from './user-type';
import { getExpiresDate } from './get-expires-date';

export const createRefreshToken = async (user: User): Promise<string> => {
  const refreshToken = uuidv4();

  try {
    const expiresAt = getExpiresDate();

    const result = await hasuraQuery(
      gql`
        mutation($refreshTokenData: refresh_tokens_insert_input!) {
          insert_refresh_tokens(objects: [$refreshTokenData]) {
            affected_rows
          }
        }
      `,
      {
        refreshTokenData: {
          user_id: user.id,
          refresh_token: refreshToken,
          expires_at: expiresAt,
        },
      },
    );

    if (getIn(result, 'data.insert_refresh_tokens.affected_rows', 0) === 0) {
      return Promise.reject(new Error('Error to create the refresh token'));
    }

    return refreshToken;
  } catch (e) {
    throw new Error('Could not create "refresh token" for user');
  }
};

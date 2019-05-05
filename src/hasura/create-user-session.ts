import getIn from 'lodash/get';
import gql from 'graphql-tag';
import { hasuraQuery } from './client';
import { User } from './user-type';
import { getExpiresDate } from './get-expires-date';

export const createUserSession = async (
  user: User,
  userAgent?: string,
  ipAddress?: string,
): Promise<string> => {
  try {
    const expiresAt = getExpiresDate();

    const result = await hasuraQuery(
      gql`
        mutation($userSessionData: [user_session_insert_input!]!) {
          insert_user_session(objects: $userSessionData) {
            returning {
              id
            }
          }
        }
      `,
      {
        userSessionData: {
          user_id: user.id,
          expires_at: expiresAt,
          user_agent: userAgent,
          ip_address: ipAddress,
        },
      },
    );

    const sessionId = getIn(result, 'data.insert_user_session.returning[0].id');

    if (sessionId === undefined) {
      return Promise.reject(new Error('Error to create the user session'));
    }

    return sessionId;
  } catch (e) {
    throw new Error('Could not create "session" for user');
  }
};

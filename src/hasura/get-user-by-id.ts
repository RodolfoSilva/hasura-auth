import { hasuraQuery } from './client';
import gql from 'graphql-tag';
import { User } from './user-type';
import { USER_FRAGMENT } from './user-fragment';

export const getUserById = async (id: string): Promise<User | undefined> => {
  try {
    const response = await hasuraQuery(
      gql`
        ${USER_FRAGMENT}
        query($id: uuid!) {
          user_by_pk(id: $id) {
            ...UserParts
          }
        }
      `,
      { id },
    );

    return response.data.user_by_pk || undefined;
  } catch (e) {
    throw new Error('Unable to find the user');
  }
};

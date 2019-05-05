import gql from 'graphql-tag';
import { hasuraQuery } from './client';
import { USER_FRAGMENT } from './user-fragment';

export const updateUser = async (where: any, payload: any) => {
  const result = await hasuraQuery(
    gql`
      ${USER_FRAGMENT}
      mutation($where: users_bool_exp!, $set: users_set_input!) {
        update_users(where: $where, _set: $set) {
          affected_rows
          returning {
            ...UserParts
          }
        }
      }
    `,
    {
      where,
      set: payload,
    },
  );

  return result.data.update_users;
};

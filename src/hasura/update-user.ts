import gql from 'graphql-tag';
import { hasuraQuery } from './client';
import { USER_FRAGMENT } from './user-fragment';

export const updateUser = async (where: any, payload: any) => {
  const result = await hasuraQuery(
    gql`
      ${USER_FRAGMENT}
      mutation($where: user_bool_exp!, $set: user_set_input!) {
        update_user(where: $where, _set: $set) {
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

  return result.data.update_user;
};

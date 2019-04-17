import { refreshTokenExpiresIn } from '../vars';

export const getExpiresDate = () => {
  return new Date(Date.now() + refreshTokenExpiresIn * 60 * 1000);
};

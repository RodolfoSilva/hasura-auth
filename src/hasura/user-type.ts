import { Role } from './role-type';

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  default_role: string;
  roles: Role[];
  password: string;
  created_at: Date;
}

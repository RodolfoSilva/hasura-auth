interface Role {
  id: string;
  role: string;
}

export interface User {
  id: string;
  organization_id: string | null;
  email: string;
  is_active: boolean;
  default_role: string;
  user_roles: [Role];
  password: string;
  created_at: Date;
  updated_at: Date;
}

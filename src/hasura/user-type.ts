export interface User {
  id: string;
  organization_id: string | null;
  email: string;
  is_active: boolean;
  role: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserRole {
  id: string;
  name: string;
  color: string;
  weight?: number;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  weight?: number;
}

export interface DashboardUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  image: string | null;
  createdAt: Date;
  roles: UserRole[];
  isBanned?: boolean;
  maxStorageBytes: number;
}

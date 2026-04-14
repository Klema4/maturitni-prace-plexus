export interface PermissionRole {
  id: string;
  name: string;
  color: string;
  permissions: string;
  weight: number;
  createdAt: Date;
  userCount: number;
}

export interface PermissionRolePayload {
  name: string;
  color: string;
  weight: number;
  permissions: string;
}

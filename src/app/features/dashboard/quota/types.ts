export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  maxStorageBytes?: number;
}

export interface UserStorageStats {
  totalFiles: number;
  totalSize: number;
}

export interface UserFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface DashboardQuotaData {
  profile: UserProfile | null;
  stats: UserStorageStats;
  files: UserFile[];
}

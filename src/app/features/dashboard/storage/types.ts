export interface StorageFolder {
  id: string;
  name: string;
  color: string;
}

export interface StorageFileRecord {
  id: string;
  folderId: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
  user: {
    name: string;
    surname: string;
    image: string | null;
  } | null;
}

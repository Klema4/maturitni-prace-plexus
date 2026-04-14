export interface Tag {
  id: string;
  name: string;
  description: string | null;
}

export interface TagPayload {
  name: string;
  description: string | null;
}

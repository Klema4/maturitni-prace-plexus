export interface SectionTag {
  id: string;
  name: string;
  description: string | null;
}

export interface Section {
  id: string;
  name: string;
  description: string | null;
  isPrimary: boolean;
  tags: SectionTag[];
}

export interface SectionPayload {
  name: string;
  description: string | null;
  isPrimary: boolean;
  tagIds: string[];
}

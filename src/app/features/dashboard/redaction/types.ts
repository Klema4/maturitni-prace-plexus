export interface RedactionMember {
  id: string;
  name: string;
  surname: string;
  email: string;
  image: string | null;
  roles: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  articlesCount: number;
  primaryRole: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface RedactionRole {
  id: string;
  name: string;
  color: string;
  weight: number;
}

export interface RedactionUser {
  id: string;
  name: string;
  surname: string;
  email: string;
}

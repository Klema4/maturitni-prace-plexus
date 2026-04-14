export interface DashboardComment {
  id: string;
  threadId: string;
  content: string;
  createdAt: Date | string;
  author: {
    id: string;
    name: string;
    surname: string;
    image: string | null;
  };
  repliesCount: number;
  thread?: {
    id: string;
    article?: {
      id: string;
      title: string;
      slug: string;
    };
  };
  isHidden?: boolean;
  isModerated?: boolean;
  moderationReason?: string | null;
  reportsCount?: number;
  editedByAdmin?: boolean;
  originalContent?: string | null;
}

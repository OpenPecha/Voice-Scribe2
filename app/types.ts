export const Roles = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  ANNOTATOR: 'ANNOTATOR',
  REVIEWER: 'REVIEWER'
} as const;

export const Status = {
  PENDING: 'PENDING',
  MODIFIED: 'MODIFIED',
  REVIEWED: 'REVIEWED',
  TRASH: 'TRASH'
} as const;

export type Role = typeof Roles[keyof typeof Roles];
export type StatusType = typeof Status[keyof typeof Status];

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  modified?: Recording[];
  reviewed?: Recording[];
}

export interface Recording {
  id: string;
  fileUrl?: string | null;
  status: StatusType;
  transcript?: string | null;
  reviewed_transcript?: string | null;
  helper_text?: string | null;
  modified_by?: { username: string } | null;
  reviewed_by?: { username: string } | null;
  modified_by_id?: string | null;
  reviewed_by_id?: string | null;
  createdAt?: Date;
  modifiedAt?: Date;
  updatedAt?: Date;
}
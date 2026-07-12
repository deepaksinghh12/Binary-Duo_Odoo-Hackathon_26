export type CategoryType = 'csr_activity' | 'challenge';

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  status?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  type?: CategoryType;
  status?: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  type: CategoryType;
  status: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

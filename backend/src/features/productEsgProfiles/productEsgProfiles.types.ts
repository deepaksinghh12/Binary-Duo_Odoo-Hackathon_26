export interface ProductEsgProfileRecord {
  id: string;
  product_name: string;
  category_id: string;
  emission_factor_id: string;
  notes: string | null;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type CreateProductEsgProfileInput = Omit<ProductEsgProfileRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type UpdateProductEsgProfileInput = Partial<CreateProductEsgProfileInput>;

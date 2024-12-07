export interface Organization {
  id: string;
  name: string;
  brand_guidelines?: string;
  tokens: number;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface TokenTransaction {
  id: string;
  organization_id: string;
  amount: number;
  action_type: 'model_creation' | 'image_generation';
  created_at: string;
  reference_id?: string; // ID of the model or image that was created
}
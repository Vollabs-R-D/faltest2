export interface AIModel {
  id: string;
  name: string;
  description: string;
  images: string[];
  created_at: string;
  status: 'training' | 'completed' | 'failed';
  type: 'category' | 'collection' | 'item';
  requestId?: string;
  trainingLogs?: string[];
  lora_file?: string;
  fal_model_id?: string;
  zip_url?: string;
}

export interface ModelFormData {
  name: string;
  description: string;
  images: string;
  modelType: 'category' | 'collection' | 'item';
}
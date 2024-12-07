import { supabase } from '../db/supabase';
import { AIModel, ModelFormData } from '@/types/model';
import { trainModel } from './falai';
import { deductTokens, TOKEN_COSTS } from '../tokens';

export async function createModel(modelData: ModelFormData, organizationId: string): Promise<AIModel> {
  const modelId = crypto.randomUUID();

  const { requestId, diffusersLoraFile } = await trainModel(modelData.images);

  await deductTokens(
    organizationId,
    TOKEN_COSTS.MODEL_CREATION,
    'model_creation',
    modelId
  );

  const { data, error } = await supabase
    .from('models')
    .insert({
      id: modelId,
      name: modelData.name,
      description: modelData.description,
      type: modelData.modelType,
      status: 'completed',
      zip_url: modelData.images,
      created_at: new Date().toISOString(),
      fal_model_id: requestId,
      lora_file: diffusersLoraFile
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getModels(): Promise<AIModel[]> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateModel(
  modelId: string,
  updates: Partial<Pick<AIModel, 'name' | 'description'>>
): Promise<AIModel> {
  const { data, error } = await supabase
    .from('models')
    .update(updates)
    .eq('id', modelId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteModel(modelId: string): Promise<void> {
  const { error } = await supabase
    .from('models')
    .delete()
    .eq('id', modelId);

  if (error) throw error;
}
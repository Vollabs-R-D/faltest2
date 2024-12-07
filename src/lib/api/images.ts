import { supabase } from '../db/supabase';
import { runInference } from './falai';
import { deductTokens, TOKEN_COSTS } from '../tokens';

export async function generateImage(
  loraPath: string,
  prompt: string,
  organizationId: string
) {
  const result = await runInference(loraPath, prompt);

  await deductTokens(
    organizationId,
    TOKEN_COSTS.IMAGE_GENERATION,
    'image_generation'
  );

  const { error } = await supabase
    .from('images')
    .insert({
      model_id: result.modelId,
      image_url: result.imageUrl,
      prompt: result.prompt,
      seed: result.seed,
      created_at: new Date().toISOString()
    });

  if (error) throw error;
  return result;
}

export async function getImages(limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}
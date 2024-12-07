import { supabase } from './supabase';
import { toast } from 'sonner';

export const TOKEN_COSTS = {
  MODEL_CREATION: 20,
  IMAGE_GENERATION: 5,
} as const;

export async function checkTokenBalance(organizationId: string): Promise<number> {
  const { data, error } = await supabase
    .from('organizations')
    .select('tokens')
    .eq('id', organizationId)
    .single();

  if (error) throw error;
  return data.tokens;
}

export async function hasEnoughTokens(
  organizationId: string, 
  action: 'model_creation' | 'image_generation'
): Promise<boolean> {
  const cost = action === 'model_creation' 
    ? TOKEN_COSTS.MODEL_CREATION 
    : TOKEN_COSTS.IMAGE_GENERATION;

  const balance = await checkTokenBalance(organizationId);
  return balance >= cost;
}

export async function deductTokens(
  organizationId: string,
  amount: number,
  action: 'model_creation' | 'image_generation',
  referenceId?: string
): Promise<void> {
  const { error: balanceError } = await supabase.rpc('deduct_tokens', {
    p_organization_id: organizationId,
    p_amount: amount
  });

  if (balanceError) throw balanceError;

  const { error: transactionError } = await supabase
    .from('token_transactions')
    .insert({
      organization_id: organizationId,
      amount: -amount,
      action_type: action,
      reference_id: referenceId,
      created_at: new Date().toISOString()
    });

  if (transactionError) throw transactionError;
}

export async function addTokens(
  organizationId: string,
  amount: number
): Promise<void> {
  const { error: balanceError } = await supabase.rpc('add_tokens', {
    p_organization_id: organizationId,
    p_amount: amount
  });

  if (balanceError) throw balanceError;

  const { error: transactionError } = await supabase
    .from('token_transactions')
    .insert({
      organization_id: organizationId,
      amount: amount,
      action_type: 'token_purchase',
      created_at: new Date().toISOString()
    });

  if (transactionError) throw transactionError;
}

export async function getTokenTransactions(
  organizationId: string,
  limit = 10,
  offset = 0
): Promise<TokenTransaction[]> {
  const { data, error } = await supabase
    .from('token_transactions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}
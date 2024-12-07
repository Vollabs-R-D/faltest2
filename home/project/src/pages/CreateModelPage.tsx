import React, { useState } from 'react';
import { ModelForm } from '../components/ModelForm';
import { ModelList } from '../components/ModelList';
import { ModelFormData, AIModel } from '../types/model';
import { Brain } from 'lucide-react';
import { trainModel } from '../services/falai';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

interface CreateModelPageProps {
  onGenerateClick?: (model: AIModel) => void;
}

export function CreateModelPage({ onGenerateClick }: CreateModelPageProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateModel = async (modelData: ModelFormData) => {
    const modelId = crypto.randomUUID();
    const trainingToastId = toast.loading(`Training model "${modelData.name}"...`, {
      duration: Infinity
    });

    try {
      setIsTraining(true);

      console.log('[App] Starting model training...');
      const { requestId, diffusersLoraFile } = await trainModel(modelData.images);
      console.log('[App] Training completed. RequestId:', requestId);
      console.log('[App] LoRA file URL:', diffusersLoraFile);

      console.log('[App] Inserting model into Supabase...');
      const { data, error: supabaseError } = await supabase
        .from('models')
        .insert({
          id: modelId,
          name: modelData.name,
          description: modelData.description,
          type: modelData.modelType,
          status: 'completed',
          zip_url: modelData.images,
          created_at: new Date(),
          fal_model_id: requestId,
          lora_file: diffusersLoraFile
        })
        .select()
        .single();

      if (supabaseError) {
        console.error('[App] Supabase insert error:', supabaseError);
        throw supabaseError;
      }
      
      console.log('[App] Inserted model data:', data);
      
      setRefreshTrigger(prev => prev + 1);
      
      toast.success(
        `Model "${modelData.name}" has been successfully trained and is ready for use!`,
        {
          id: trainingToastId,
          duration: 5000,
          className: 'bg-green-50',
          description: 'You can now use this model for inference.'
        }
      );

    } catch (error) {
      console.error('[App] Failed to create model:', error);
      
      toast.error(`Failed to train model "${modelData.name}"`, {
        id: trainingToastId,
        duration: 5000,
        description: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex items-center justify-center">
          <Brain className="h-12 w-12 text-blue-600" />
          <h1 className="ml-3 text-3xl font-bold text-gray-900">AI Model Creator</h1>
        </div>
        <p className="mt-2 text-gray-600">Create and manage your custom AI models</p>
      </div>

      <div className="mt-12 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Create New Model</h2>
        <div className="mt-6">
          <ModelForm onSubmit={handleCreateModel} isLoading={isTraining} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Your Models</h2>
        <ModelList 
          refreshTrigger={refreshTrigger} 
          editable={true} 
          onGenerateClick={onGenerateClick}
        />
      </div>
    </div>
  );
}
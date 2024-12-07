import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { AIModel } from '../types/model';
import { ModelSelector } from '../components/ModelSelector';
import { PromptForm } from '../components/PromptForm';
import { runInference } from '../services/inference';
import { toast } from 'sonner';

interface InferencePageProps {
  initialModel?: AIModel;
}

export function InferencePage({ initialModel }: InferencePageProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | undefined>(initialModel);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>();
  const [currentPrompt, setCurrentPrompt] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching models:', error);
        toast.error('Failed to load models');
      } else {
        setModels(data);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    setSelectedModel(initialModel);
  }, [initialModel]);

  const handleGenerate = async (prompt: string) => {
    if (!selectedModel?.lora_file) {
      toast.error('Please select a model first');
      return;
    }

    setIsGenerating(true);
    setCurrentPrompt(prompt);
    const toastId = toast.loading('Generating image...');

    try {
      const result = await runInference(selectedModel.lora_file, prompt);
      setGeneratedImage(result.imageUrl);

      const { error: saveError } = await supabase
        .from('images')
        .insert({
          model_id: selectedModel.id,
          image_url: result.imageUrl,
          prompt: result.prompt,
          seed: result.seed,
          created_at: new Date().toISOString()
        });

      if (saveError) {
        console.error('Failed to save generated image:', saveError);
        toast.error('Generated successfully but failed to save metadata', { id: toastId });
      } else {
        toast.success('Image generated and saved successfully!', { id: toastId });
      }
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate image', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="px-8 py-12">
      <div className="space-y-12">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-black">Select a Model</h2>
          <div className="mt-6">
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          </div>
        </div>

        {selectedModel && (
          <div id="generate-section" className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black">Generate Image</h2>
            <div className="mt-6">
              <PromptForm 
                onSubmit={handleGenerate} 
                isLoading={isGenerating}
                initialPrompt={currentPrompt}
                selectedModel={selectedModel}
              />
            </div>
          </div>
        )}

        {generatedImage && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-black">Generated Image</h2>
            <img
              src={generatedImage}
              alt="Generated"
              className="mx-auto rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
}
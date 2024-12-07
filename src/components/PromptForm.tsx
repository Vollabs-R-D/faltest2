import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { AIModel } from '../types/model';

interface PromptFormProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
  initialPrompt?: string;
  selectedModel?: AIModel;
}

export function PromptForm({ onSubmit, isLoading, initialPrompt = '', selectedModel }: PromptFormProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    if (selectedModel?.description) {
      setPrompt(selectedModel.description);
    } else if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [selectedModel, initialPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    
    await onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-black">
          Enter your prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          placeholder="Describe what you want to generate..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className={`flex w-full items-center justify-center rounded-md px-4 py-2 text-white ${
          isLoading || !prompt.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-black hover:bg-gray-900'
        }`}
      >
        <Send className="mr-2" size={20} />
        {isLoading ? 'Generating...' : 'Generate Image'}
      </button>
    </form>
  );
}
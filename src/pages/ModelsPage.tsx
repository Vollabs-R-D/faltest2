import React from 'react';
import { ModelList } from '../components/ModelList';
import { AIModel } from '../types/model';

interface ModelsPageProps {
  onGenerateClick?: (model: AIModel) => void;
}

export function ModelsPage({ onGenerateClick }: ModelsPageProps) {
  return (
    <div className="px-8 py-12">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-black">Your Models</h2>
        <div className="mt-6">
          <ModelList editable={true} onGenerateClick={onGenerateClick} />
        </div>
      </div>
    </div>
  );
}
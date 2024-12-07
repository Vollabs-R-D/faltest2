import React, { useState } from 'react';
import { AIModel } from '../types/model';
import { ChevronDown } from 'lucide-react';
import { formatDate } from '../utils/date';

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel?: AIModel;
  onSelectModel: (model: AIModel) => void;
}

const ITEMS_PER_PAGE = 6;

export function ModelSelector({ models, selectedModel, onSelectModel }: ModelSelectorProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const showMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  const displayedModels = models.slice(0, displayCount);
  const hasMore = displayCount < models.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedModels.map((model) => (
          <div
            key={model.id}
            className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
              selectedModel?.id === model.id
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            onClick={() => onSelectModel(model)}
          >
            <h3 className="font-semibold text-black">{model.name}</h3>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{model.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              Created {formatDate(model.created_at)}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={showMore}
            className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50"
          >
            <ChevronDown className="h-4 w-4" />
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
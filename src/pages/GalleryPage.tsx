import React from 'react';
import { GeneratedImagesList } from '../components/GeneratedImagesList';

interface GalleryPageProps {
  onRemix?: (image: { prompt: string; seed: string; model_id: string }) => void;
}

export function GalleryPage({ onRemix }: GalleryPageProps) {
  return (
    <div className="px-8 py-12">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-black">Generated Images</h2>
        <div className="mt-6">
          <GeneratedImagesList onRemix={onRemix} />
        </div>
      </div>
    </div>
  );
}
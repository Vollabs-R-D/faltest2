import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Image, Wand, ChevronDown } from 'lucide-react';

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
  seed: string;
  created_at: string;
  model_id: string;
}

interface GeneratedImagesListProps {
  onRemix?: (image: GeneratedImage) => void;
  refreshTrigger?: number;
}

const ITEMS_PER_PAGE = 6;

export function GeneratedImagesList({ onRemix, refreshTrigger = 0 }: GeneratedImagesListProps) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setImages(data);
    }
  };

  useEffect(() => {
    fetchImages();

    const channel = supabase
      .channel('generated_images_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'images' },
        (payload) => {
          setImages(current => [payload.new as GeneratedImage, ...current]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchImages();
    }
  }, [refreshTrigger]);

  const showMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <Image className="mx-auto h-12 w-12 text-black" />
        <h3 className="mt-2 text-sm font-semibold text-black">No images</h3>
        <p className="mt-1 text-sm text-gray-500">
          Generate your first image to see it here
        </p>
      </div>
    );
  }

  const displayedImages = images.slice(0, displayCount);
  const hasMore = displayCount < images.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedImages.map((image) => (
          <div key={image.id} className="overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            <img
              src={image.image_url}
              alt={image.prompt}
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <p className="text-sm text-black line-clamp-2">{image.prompt}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  <div>Seed: {image.seed}</div>
                  <div>{new Date(image.created_at).toLocaleDateString()}</div>
                </div>
                {onRemix && (
                  <button
                    onClick={() => onRemix(image)}
                    className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-black hover:bg-gray-200"
                  >
                    <Wand className="h-3 w-3" />
                    Remix
                  </button>
                )}
              </div>
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
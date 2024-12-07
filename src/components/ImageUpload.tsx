import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imagePromises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    const newImages = await Promise.all(imagePromises);
    onImagesChange([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground/80">
        Training Images
      </label>
      <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div key={index} className="group relative aspect-square">
            <img
              src={image}
              alt={`Training ${index + 1}`}
              className="h-full w-full rounded-lg object-cover transition-all duration-200 group-hover:opacity-80"
            />
            <Button
              type="button"
              onClick={() => removeImage(index)}
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={16} />
            </Button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input bg-background/50 transition-colors hover:border-primary/50 hover:bg-accent">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            multiple
          />
          <Plus className="h-8 w-8 text-foreground/40" />
        </label>
      </div>
    </div>
  );
}
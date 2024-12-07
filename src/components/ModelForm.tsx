import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { ModelFormData } from '../types/model';
import JSZip from 'jszip';
import { supabase } from '../services/supabase';
import { ImageUpload } from './ImageUpload';
import { generateDescriptionFromMultipleImages } from '../services/imageDescription';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface ModelFormProps {
  onSubmit: (model: ModelFormData) => Promise<void>;
  isLoading: boolean;
}

type ModelType = 'category' | 'collection' | 'item';

const MODEL_TYPE_INFO = {
  category: {
    title: 'Category',
    description: 'Groups similar products by their basic type or purpose',
    example: 'Example: "Drapery rod finials"'
  },
  collection: {
    title: 'Collection',
    description: 'Products share visual style but serve different functions',
    example: 'Example: "Bellwood"'
  },
  item: {
    title: 'Item',
    description: 'Single product that may have variations like color/size',
    example: 'Example: "Oslo Dining Chair", "Lunar Table Lamp"'
  }
} as const;

async function createImageZip(images: string[]): Promise<Blob> {
  const zip = new JSZip();
  images.forEach((base64String, index) => {
    const imageData = base64String.split(',')[1];
    const extension = base64String.split(';')[0].split('/')[1];
    zip.file(`image_${index + 1}.${extension}`, imageData, { base64: true });
  });
  return await zip.generateAsync({ type: 'blob' });
}

async function uploadZipToSupabase(zipBlob: Blob): Promise<string> {
  const fileName = `training_images_${Date.now()}.zip`;
  const { data, error } = await supabase.storage
    .from('training-images')
    .upload(fileName, zipBlob, {
      contentType: 'application/zip',
    });

  if (error) {
    throw new Error('Failed to upload zip file: ' + error.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('training-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

async function uploadImageToSupabase(base64Image: string): Promise<string> {
  const imageData = base64Image.split(',')[1];
  const extension = base64Image.split(';')[0].split('/')[1];
  const fileName = `temp_image_${Date.now()}.${extension}`;
  
  const byteCharacters = atob(imageData);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: `image/${extension}` });

  const { data, error } = await supabase.storage
    .from('temp-images')
    .upload(fileName, blob, {
      contentType: `image/${extension}`,
    });

  if (error) {
    throw new Error('Failed to upload image: ' + error.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('temp-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

export function ModelForm({ onSubmit, isLoading }: ModelFormProps) {
  const [name, setName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [modelType, setModelType] = useState<ModelType>('item');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploadProgress('Uploading images for description generation...');
      const imageUrls = await Promise.all(
        images.map(image => uploadImageToSupabase(image))
      );

      setUploadProgress('Generating description from images...');
      setIsGeneratingDescription(true);
      const description = await generateDescriptionFromMultipleImages(imageUrls);
      setIsGeneratingDescription(false);

      setUploadProgress('Creating zip file...');
      const zipBlob = await createImageZip(images);
      
      setUploadProgress('Uploading zip file...');
      const zipUrl = await uploadZipToSupabase(zipBlob);
      
      setUploadProgress('Submitting model...');
      await onSubmit({ 
        name, 
        description, 
        images: zipUrl,
        modelType 
      });
      
      setName('');
      setImages([]);
      setUploadProgress('');
      setModelType('item');
    } catch (error) {
      console.error('Error processing images:', error);
      setUploadProgress('Error: Failed to process images');
      toast.error('Failed to process images. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-foreground/80">
          Model Type
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(MODEL_TYPE_INFO) as ModelType[]).map((type) => (
            <Card
              key={type}
              className={`cursor-pointer transition-all duration-200 ${
                modelType === type
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setModelType(type)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="modelType"
                    value={type}
                    checked={modelType === type}
                    onChange={() => setModelType(type)}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="font-medium text-foreground">
                    {MODEL_TYPE_INFO[type].title}
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground/80">
                  {MODEL_TYPE_INFO[type].description}
                </p>
                <p className="mt-1 text-xs text-foreground/60 italic">
                  {MODEL_TYPE_INFO[type].example}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground/80">
          Model Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <ImageUpload images={images} onImagesChange={setImages} />

      {uploadProgress && (
        <div className="text-sm text-foreground/80">{uploadProgress}</div>
      )}

      <Button
        type="submit"
        disabled={isLoading || isGeneratingDescription || images.length === 0}
        variant="chrome"
        className="w-full"
      >
        <Upload className="mr-2" size={20} />
        {isLoading ? 'Training Model...' : 
         isGeneratingDescription ? 'Generating Description...' : 
         'Create Model'}
      </Button>
    </form>
  );
}
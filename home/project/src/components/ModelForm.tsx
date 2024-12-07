import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { ModelFormData } from '../types/model';
import JSZip from 'jszip';
import { supabase } from '../services/supabase';
import { ImageUpload } from './ImageUpload';
import { generateDescriptionFromMultipleImages } from '../services/imageDescription';
import { toast } from 'sonner';

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
  
  // Convert base64 images to blobs and add to zip
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

  // Get public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('training-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

// Function to upload a single image and get its URL
async function uploadImageToSupabase(base64Image: string): Promise<string> {
  const imageData = base64Image.split(',')[1];
  const extension = base64Image.split(';')[0].split('/')[1];
  const fileName = `temp_image_${Date.now()}.${extension}`;
  
  // Convert base64 to blob
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
      // First, upload individual images to get their URLs
      setUploadProgress('Uploading images for description generation...');
      const imageUrls = await Promise.all(
        images.map(image => uploadImageToSupabase(image))
      );

      // Generate description from the uploaded images
      setUploadProgress('Generating description from images...');
      setIsGeneratingDescription(true);
      const description = await generateDescriptionFromMultipleImages(imageUrls);
      setIsGeneratingDescription(false);

      // Create and upload the zip file for training
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
      
      // Clean up temporary images
      // Note: In a production environment, you'd want to implement proper cleanup
      
      // Clear form after successful submission
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Model Type
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(MODEL_TYPE_INFO) as ModelType[]).map((type) => (
            <div
              key={type}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-blue-300 ${
                modelType === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
              onClick={() => setModelType(type)}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="modelType"
                  value={type}
                  checked={modelType === type}
                  onChange={() => setModelType(type)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900">
                  {MODEL_TYPE_INFO[type].title}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {MODEL_TYPE_INFO[type].description}
              </p>
              <p className="mt-1 text-xs text-gray-500 italic">
                {MODEL_TYPE_INFO[type].example}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Model Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <ImageUpload images={images} onImagesChange={setImages} />

      {uploadProgress && (
        <div className="text-sm text-blue-600">{uploadProgress}</div>
      )}

      <button
        type="submit"
        disabled={isLoading || isGeneratingDescription || images.length === 0}
        className={`flex w-full items-center justify-center rounded-md px-4 py-2 text-white ${
          isLoading || isGeneratingDescription || images.length === 0
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <Upload className="mr-2" size={20} />
        {isLoading ? 'Training Model...' : 
         isGeneratingDescription ? 'Generating Description...' : 
         'Create Model'}
      </button>
    </form>
  );
}
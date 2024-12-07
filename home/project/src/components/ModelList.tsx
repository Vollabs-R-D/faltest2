import React, { useEffect, useState } from 'react';
import { Brain, CheckCircle, XCircle, Loader2, ChevronDown, Trash2, Wand, Pencil } from 'lucide-react';
import { supabase } from '../services/supabase';
import { AIModel } from '../types/model';
import { toast } from 'sonner';

interface ModelListProps {
  refreshTrigger?: number;
  editable?: boolean;
  onGenerateClick?: (model: AIModel) => void;
}

const ITEMS_PER_PAGE = 6;

interface EditModelFormProps {
  model: AIModel;
  onSave: () => void;
  onCancel: () => void;
}

function EditModelForm({ model, onSave, onCancel }: EditModelFormProps) {
  const [name, setName] = useState(model.name);
  const [description, setDescription] = useState(model.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('models')
        .update({ name, description })
        .eq('id', model.id);

      if (error) throw error;

      toast.success('Model updated successfully');
      onSave();
    } catch (error) {
      console.error('Failed to update model:', error);
      toast.error('Failed to update model');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Model Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:bg-gray-400"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export function ModelList({ refreshTrigger = 0, editable = false, onGenerateClick }: ModelListProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching models:', error);
      } else {
        setModels(data);
      }
    };

    fetchModels();
  }, [refreshTrigger]);

  const handleDelete = async (model: AIModel) => {
    if (!window.confirm(`Are you sure you want to delete "${model.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', model.id);

      if (error) throw error;

      toast.success('Model deleted successfully');
      setModels(models.filter(m => m.id !== model.id));
    } catch (error) {
      console.error('Failed to delete model:', error);
      toast.error('Failed to delete model');
    } finally {
      setIsDeleting(false);
    }
  };

  const showMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12">
        <Brain className="h-12 w-12 text-black" />
        <h3 className="mt-2 text-sm font-medium text-black">No models</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new model</p>
      </div>
    );
  }

  const getStatusIcon = (status: AIModel['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-black" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'training':
        return <Loader2 className="h-5 w-5 text-black animate-spin" />;
    }
  };

  const displayedModels = models.slice(0, displayCount);
  const hasMore = displayCount < models.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedModels.map((model) => (
          <div
            key={model.id}
            className="group relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex flex-col h-full p-4 sm:p-6">
              {editingModel?.id === model.id && editable ? (
                <EditModelForm
                  model={model}
                  onSave={() => {
                    setEditingModel(null);
                    setModels(currentModels =>
                      currentModels.map(m =>
                        m.id === model.id
                          ? { ...m, name: editingModel.name, description: editingModel.description }
                          : m
                      )
                    );
                  }}
                  onCancel={() => setEditingModel(null)}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-8 w-8 text-black" />
                      <div>
                        <h3 className="font-semibold text-black line-clamp-1">{model.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{model.description}</p>
                      </div>
                    </div>
                    {getStatusIcon(model.status)}
                  </div>

                  <div className="flex flex-col justify-between flex-grow">
                    <div className="text-xs text-gray-500 mt-4">
                      Created {new Date(model.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {editable && (
                        <>
                          <button
                            onClick={() => setEditingModel(model)}
                            className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1.5 text-sm font-medium text-black hover:bg-gray-200"
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(model)}
                            disabled={isDeleting}
                            className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                          </button>
                        </>
                      )}
                      {model.status === 'completed' && onGenerateClick && (
                        <button
                          onClick={() => onGenerateClick(model)}
                          className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1.5 text-sm font-medium text-black hover:bg-gray-200"
                        >
                          <Wand className="mr-1.5 h-3.5 w-3.5" />
                          Generate
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={showMore}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <ChevronDown className="h-4 w-4" />
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
import { fal } from "@fal-ai/client";

fal.config({
  credentials: "3b511e22-ac67-4f03-be03-bb33ab19c5b0:d426602948931daaeff08070074e67a0"
});

function isValidZipUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return url.toLowerCase().endsWith('.zip');
  } catch {
    return false;
  }
}

export async function trainModel(imagesData: string): Promise<{ 
  requestId: string; 
  logs: string[];
  diffusersLoraFile: string;
}> {
  const logs: string[] = [];
  
  if (!isValidZipUrl(imagesData)) {
    throw new Error('imagesData must be a valid URL pointing to a zip archive');
  }

  try {
    console.log('[FAL.AI] Starting model training with images:', imagesData);
    
    const result = await fal.subscribe("fal-ai/flux-lora-fast-training", {
      input: {
        images_data_url: imagesData,
        steps: 10
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('[FAL.AI] Queue update:', update);
        if (update.status === "IN_PROGRESS") {
          const newLogs = update.logs.map((log) => log.message);
          logs.push(...newLogs);
        }
      },
    });

    console.log('[FAL.AI] Raw API response:', JSON.stringify(result, null, 2));
    console.log('[FAL.AI] Result data:', result.data);
    console.log('[FAL.AI] Diffusers LoRA file:', result.data?.diffusers_lora_file);

    // Extract the lora file URL from the result data
    const diffusersLoraFile = result.data?.diffusers_lora_file?.url || '';
    console.log('[FAL.AI] Extracted LoRA file URL:', diffusersLoraFile);

    return {
      requestId: result.requestId,
      logs,
      diffusersLoraFile
    };
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; response?: unknown };
    console.error('[FAL.AI] Training failed:', {
      error: err,
      message: err.message,
      status: err.status,
      response: err.response
    });
    throw error;
  }
}
import { fal } from "@fal-ai/client";

export interface InferenceResult {
  imageUrl: string;
  requestId: string;
  seed: string;
  prompt: string;
}

export async function runInference(loraPath: string, prompt: string): Promise<InferenceResult> {
  try {
    console.log('[FAL.AI] Starting inference with LoRA:', loraPath);
    
    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        loras: [
          {
            path: loraPath,
            scale: 1.5
          }
        ],
        prompt,
        guidance_scale: 5,
        enable_safety_checker: true
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('[FAL.AI] Inference completed:', result);

    return {
      imageUrl: result.data.images[0].url,
      requestId: result.requestId,
      seed: String(result.data.seed),
      prompt: result.data.prompt
    };
  } catch (error) {
    console.error('[FAL.AI] Inference failed:', error);
    throw error;
  }
}
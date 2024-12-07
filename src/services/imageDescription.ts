import { fal } from "@fal-ai/client";

export async function generateImageDescription(imageUrl: string): Promise<string> {
  try {
    console.log('[FAL.AI] Generating description for image:', imageUrl);
    
    const result = await fal.subscribe("fal-ai/any-llm/vision", {
      input: {
        prompt: "Caption this image for a text-to-image model with as much detail as possible.",
        image_url: imageUrl
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('[FAL.AI] Description generated:', result.data.output);
    return result.data.response;
  } catch (error) {
    console.error('[FAL.AI] Failed to generate description:', error);
    throw error;
  }
}

export async function generateDescriptionFromMultipleImages(images: string[]): Promise<string> {
  try {
    // Generate descriptions for all images
    const descriptions = await Promise.all(
      images.map(imageUrl => generateImageDescription(imageUrl))
    );

    // Combine descriptions into a single, comprehensive description
    const combinedDescription = descriptions.join(' ');

    return combinedDescription;
  } catch (error) {
    console.error('Failed to generate descriptions:', error);
    throw error;
  }
}
import { getImageProvider } from "./image-providers";
import { saveGeneratedImage, type GeneratedImageDB } from "./invitations-service";

export interface GenerateAndSaveImageInput {
  projectId: string;
  promptId?: string | null;
  prompt: string;
  providerId?: string;
  /** Reserved for future providers (e.g. size, style, seed, BYOP keys). */
  metadata?: Record<string, unknown>;
}
export async function generateAndSaveImage(
  input: GenerateAndSaveImageInput,
): Promise<GeneratedImageDB> {
  console.log(
  "[IMAGE] providerId recibido:",
  input.providerId
);
  console.log("[IMG] providerId:", input.providerId);

  const provider = getImageProvider(input.providerId);

  console.log("[IMG] provider:", provider.id);

  const result = await provider.generate(input.prompt, {
    metadata: input.metadata,
  });

  console.log("[IMG] generated:", result);

  console.log("[IMG] calling saveGeneratedImage");

  const { url, provider: providerName } = result;

  return saveGeneratedImage({
    projectId: input.projectId,
    promptId: input.promptId ?? null,
    url,
    provider: providerName,
  });
  
}

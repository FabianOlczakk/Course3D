import { z } from "zod";

// Limit pojedynczego załącznika: 5 MB. Załączniki przechowywane są jako base64
// w polu JSON (do czasu wdrożenia S3/R2). Maksymalnie 3 załączniki.
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS = 3;
// base64 ma ~4/3 narzut względem rozmiaru binarnego.
const MAX_BASE64_LENGTH = Math.ceil((MAX_ATTACHMENT_SIZE * 4) / 3) + 1024;

export const attachmentSchema = z.object({
  url: z.string().min(1).max(MAX_BASE64_LENGTH, "Załącznik jest za duży."),
  name: z.string().min(1).max(255),
  size: z.number().int().nonnegative().max(MAX_ATTACHMENT_SIZE).optional(),
  type: z.string().max(255).optional(),
});

export const attachmentsSchema = z
  .array(attachmentSchema)
  .max(MAX_ATTACHMENTS, `Maksymalnie ${MAX_ATTACHMENTS} załączniki.`)
  .optional();

export type Attachment = z.infer<typeof attachmentSchema>;

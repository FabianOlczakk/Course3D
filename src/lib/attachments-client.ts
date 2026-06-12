import { MAX_ATTACHMENT_SIZE, MAX_ATTACHMENTS, type Attachment } from "./attachments";

export { MAX_ATTACHMENT_SIZE, MAX_ATTACHMENTS };
export type { Attachment };

// Konwertuje plik na base64 (data URL). Załączniki przechowywane są jako base64
// w polu JSON do czasu wdrożenia S3/R2.
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

// Wczytuje wybrane pliki, sprawdza limity i zwraca tablicę załączników.
// Rzuca błąd (komunikat po polsku) przy przekroczeniu limitów.
export async function readAttachments(
  files: FileList | File[],
  existingCount = 0
): Promise<Attachment[]> {
  const list = Array.from(files);
  if (existingCount + list.length > MAX_ATTACHMENTS) {
    throw new Error(`Maksymalnie ${MAX_ATTACHMENTS} załączniki.`);
  }
  const result: Attachment[] = [];
  for (const file of list) {
    if (file.size > MAX_ATTACHMENT_SIZE) {
      throw new Error(
        `Plik "${file.name}" przekracza limit 5 MB.`
      );
    }
    const url = await fileToBase64(file);
    result.push({ url, name: file.name, size: file.size, type: file.type });
  }
  return result;
}

export function isImage(att: Attachment): boolean {
  return Boolean(att.type?.startsWith("image/"));
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

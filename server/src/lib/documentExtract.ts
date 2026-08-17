// Extracts plain text from uploaded evidence documents. Supported: .txt/.md,
// .pdf, .docx. Nothing here treats extracted text as proof of competence — see
// documentaryEvidence.ts for the conservative scoring applied to it.
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

export async function extractText(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const lower = filename.toLowerCase();

  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimeType.startsWith("text/") || lower.endsWith(".txt") || lower.endsWith(".md")) {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${mimeType || filename}. Supported: .txt, .md, .pdf, .docx`);
}

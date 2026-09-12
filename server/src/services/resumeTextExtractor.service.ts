import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

export const extractResumeText = async (
  filePath: string
): Promise<string> => {
  const pdfBuffer = await readFile(filePath);

  const parser = new PDFParse({
    data: pdfBuffer,
  });

  try {
    const result = await parser.getText();

    return result.text.trim();
  } finally {
    await parser.destroy();
  }
};
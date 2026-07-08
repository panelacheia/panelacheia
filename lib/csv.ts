import { normalize } from "@/lib/normalize";

export type CsvRow = Record<string, string>;

function detectDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

function splitLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Aceita planilhas exportadas com vírgula ou ponto-e-vírgula (padrão do Excel em pt-BR).
export function parseCsv(text: string): CsvRow[] {
  const withoutBom = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const clean = withoutBom.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = clean.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitLine(lines[0], delimiter).map((h) => normalize(h));

  return lines.slice(1).map((line) => {
    const values = splitLine(line, delimiter);
    const row: CsvRow = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });
    return row;
  });
}

export function generateProductTemplateCsv(): string {
  const headers = ["nome", "categoria", "unidade", "preco", "promocao", "preco_antes", "ativo"];
  const exemplo1 = ["Açúcar Cristal União 1kg", "Mercearia", "un", "6.99", "nao", "", "sim"];
  const exemplo2 = ["Banana Prata", "Hortifruti", "kg", "7.90", "sim", "9.90", "sim"];
  return [headers, exemplo1, exemplo2].map((row) => row.join(";")).join("\n");
}

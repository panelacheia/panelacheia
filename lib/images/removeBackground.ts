import { Jimp } from "jimp";

const THRESHOLD = 28;

/**
 * Remove um fundo sólido/uniforme (branco, cinza claro etc.) de uma foto de produto,
 * preenchendo com transparência. Faz flood-fill a partir das bordas, comparando cada
 * pixel com a cor média dos 4 cantos da imagem — funciona bem para fotos de catálogo
 * com fundo liso, e não mexe em fotos com fundo "de cena" (tábua, prato, mesa).
 * Se a imagem não puder ser processada, devolve o buffer original sem alterar.
 */
export async function removeBackground(input: Buffer): Promise<Buffer> {
  try {
    const image = await Jimp.read(input);
    const { width, height, data } = image.bitmap;
    const total = width * height;

    const corners: [number, number][] = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
    ];
    let rRef = 0;
    let gRef = 0;
    let bRef = 0;
    for (const [cx, cy] of corners) {
      const off = (cy * width + cx) * 4;
      rRef += data[off];
      gRef += data[off + 1];
      bRef += data[off + 2];
    }
    rRef /= 4;
    gRef /= 4;
    bRef /= 4;

    const visited = new Uint8Array(total);
    const isBg = new Uint8Array(total);
    const stack = new Int32Array(total);
    let sp = 0;

    const pushIfMatch = (idx: number) => {
      if (visited[idx]) return;
      visited[idx] = 1;
      const off = idx * 4;
      const dr = data[off] - rRef;
      const dg = data[off + 1] - gRef;
      const db = data[off + 2] - bRef;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist < THRESHOLD) {
        isBg[idx] = 1;
        stack[sp++] = idx;
      }
    };

    for (let x = 0; x < width; x++) {
      pushIfMatch(x);
      pushIfMatch((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      pushIfMatch(y * width);
      pushIfMatch(y * width + (width - 1));
    }

    while (sp > 0) {
      const idx = stack[--sp];
      const x = idx % width;
      const y = (idx / width) | 0;
      if (x > 0) pushIfMatch(idx - 1);
      if (x < width - 1) pushIfMatch(idx + 1);
      if (y > 0) pushIfMatch(idx - width);
      if (y < height - 1) pushIfMatch(idx + width);
    }

    // Fundo detectado em menos de 3% ou mais de 97% da imagem: provavelmente não é
    // uma foto de catálogo com fundo liso, então não mexe pra não estragar a foto.
    let removed = 0;
    for (let i = 0; i < total; i++) if (isBg[i]) removed++;
    const ratio = removed / total;
    if (ratio < 0.03 || ratio > 0.97) return input;

    for (let i = 0; i < total; i++) {
      if (isBg[i]) data[i * 4 + 3] = 0;
    }

    return await image.getBuffer("image/png");
  } catch {
    return input;
  }
}

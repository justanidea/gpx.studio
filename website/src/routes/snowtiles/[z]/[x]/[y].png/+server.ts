// website/src/routes/snowtiles/[z]/[x]/[y].png/+server.ts
import { error } from '@sveltejs/kit';
import sharp from 'sharp';

const tileCache = new Map<string, Buffer>();

export async function GET({ params }) {
    const { z, x, y } = params;
    const cacheKey = `${z}/${x}/${y}`;

    const cached = tileCache.get(cacheKey);
    if (cached) {
        return new Response(new Uint8Array(cached), {
            headers: { 'Content-Type': 'image/png' }
        });
    }

    const url = `https://worldmaps.reliefmaps.io/styles/SnowMaskV3/${z}/${x}/${y}.png`;
    const response = await fetch(url);

    if (!response.ok) {
        throw error(404, 'tile not found');
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const { data, info } = await sharp(buffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const pixels = Buffer.from(data);

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const redScore = r - Math.max(g, b);

        if (redScore > 20) {
            pixels[i] = 255;
            pixels[i + 1] = 255;
            pixels[i + 2] = 255;
            pixels[i + 3] = 255;
        } else {
            pixels[i + 3] = 0;
        }
    }

    const output = await sharp(pixels, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 4
        }
    }).png().toBuffer();

    tileCache.set(cacheKey, output);
    return new Response(new Uint8Array(output), {
        headers: { 'Content-Type': 'image/png' }
    });
}
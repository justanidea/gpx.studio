import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';


function extractPhotos($: cheerio.CheerioAPI) {
    return $('img[src*="/photos_points/"]')
        .map((_, img) => {
            const src = $(img).attr('src');
            return src ? `https://www.refuges.info${src}` : null;
        })
        .get()
        .filter(Boolean) as string[];
}

function extractPoiDetails($: cheerio.CheerioAPI) {
    const sections: { key: string; value: string }[] = [];
    let contact: string | null = null;

    $('dt').each((_, dt) => {
        const key = $(dt)
            .text()
            .trim()
            .replace(':', '')
            .toLowerCase();

        const dd = $(dt).next('dd');
        if (!dd.length) return;

        let value = dd
            .html()
            ?.replace(/<br\s*\/?>/gi, '\n')
            .replace(/&nbsp;/g, ' ')
            .replace(/<[^>]*>/g, '')
            .trim() ?? '';

        if (key.includes('vous êtes')) {
            contact = value;
            return;
        }

        if (key === 'informations complémentaires') return;

        sections.push({ key, value });
    });

    return { sections, contact };
}

export async function GET({ url }) {
    const target = url.searchParams.get('url');

    if (!target) {
        return json({ error: 'missing url' }, { status: 400 });
    }

    const response = await fetch(target);
    const html = await response.text();
    const $ = cheerio.load(html);

    const { sections, contact } = extractPoiDetails($);
    const photos = extractPhotos($);

    return json({
        sections,
        contact,
        photos
    });
}


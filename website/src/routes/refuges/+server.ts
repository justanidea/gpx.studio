import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    const bbox = url.searchParams.get('bbox');
    const response = await fetch(
        `https://www.refuges.info/api/bbox?bbox=${bbox}&format=geojson&detail=simple`
    );

    const data = await response.json();
    return json(data);
}   
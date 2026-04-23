export async function GET({ params }) {
    const url = `https://www.refuges.info/images/icones/${params.name}.svg`;
    const res = await fetch(url);

    if (!res.ok) {
        return new Response('Not found', { status: 404 });
    }
    return new Response(res.body, {
        headers: {
            'Content-Type': 'image/svg+xml'
        }
    });
}
export async function POST({ request }) {
    const body = await request.json();

    const res = await fetch('https://graphhopper.gpx.studio/route', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}


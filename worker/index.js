export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return Response.json({ error: 'POST only' }, { status: 405 });
    }

    const cors = { 'Access-Control-Allow-Origin': '*' };

    try {
      let imageBytes;
      const contentType = request.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        const json = await request.json();
        if (json.base64) {
          const binary = atob(json.base64);
          imageBytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            imageBytes[i] = binary.charCodeAt(i);
          }
        } else if (json.image) {
          imageBytes = new Uint8Array(json.image);
        }
      } else {
        imageBytes = new Uint8Array(await request.arrayBuffer());
      }

      if (!imageBytes || imageBytes.byteLength < 100) {
        return Response.json({ error: 'No image provided' }, { status: 400, headers: cors });
      }

      const result = await env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
        image: [...imageBytes],
        prompt: 'Describe what is in this image in detail.',
      });

      return Response.json(result, { headers: cors });
    } catch (e) {
      return Response.json({ error: e.message || 'Internal error' }, { status: 500, headers: cors });
    }
  },
};

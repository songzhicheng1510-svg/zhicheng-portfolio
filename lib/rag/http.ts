const PUBLIC_API_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

export function publicJson(
  body: unknown,
  init: ResponseInit = {},
): Response {
  return Response.json(body, {
    ...init,
    headers: {
      ...PUBLIC_API_HEADERS,
      ...init.headers,
    },
  });
}

export function publicOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: PUBLIC_API_HEADERS,
  });
}

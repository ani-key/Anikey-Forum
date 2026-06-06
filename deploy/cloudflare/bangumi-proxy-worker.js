const API_ORIGIN = 'https://api.bgm.tv'
const IMAGE_HOST_ALLOWLIST = new Set([
  'lain.bgm.tv',
  'lain.bangumi.tv',
  'bgm.tv',
  'bangumi.tv',
])

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Accept',
  'Access-Control-Max-Age': '86400',
}

function withCors(response) {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value)
  }
  headers.set('Cache-Control', headers.get('Cache-Control') || 'public, max-age=300')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

async function proxyImage(requestUrl) {
  const target = requestUrl.searchParams.get('url')
  if (!target) return jsonError('Missing image url')

  let parsed
  try {
    parsed = new URL(target)
  } catch {
    return jsonError('Invalid image url')
  }

  if (parsed.protocol !== 'https:' || !IMAGE_HOST_ALLOWLIST.has(parsed.hostname)) {
    return jsonError('Image host is not allowed', 403)
  }

  const upstream = await fetch(parsed.toString(), {
    headers: {
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      Referer: 'https://bgm.tv/',
    },
  })

  const headers = new Headers(upstream.headers)
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value)
  }
  headers.set('Cache-Control', 'public, max-age=604800, immutable')

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  })
}

async function proxyApi(request, requestUrl) {
  const upstreamUrl = new URL(requestUrl.pathname + requestUrl.search, API_ORIGIN)
  const headers = new Headers(request.headers)
  headers.set('Accept', 'application/json')
  headers.delete('Host')
  headers.delete('Origin')
  headers.delete('Referer')

  const upstream = await fetch(upstreamUrl.toString(), {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
  })

  return withCors(upstream)
}

export default {
  async fetch(request) {
    const requestUrl = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (requestUrl.pathname === '/image') {
      return proxyImage(requestUrl)
    }

    if (requestUrl.pathname === '/calendar' || requestUrl.pathname.startsWith('/v0/')) {
      return proxyApi(request, requestUrl)
    }

    return jsonError('Not found', 404)
  },
}

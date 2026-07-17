import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const maxDuration = 300;

async function handleRequest(request, { params }) {
  const pathParts = await params;
  const path = pathParts.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const baseUrl = (process.env.BACKEND_URL || '').replace(/\/+$/g, '');
  const backendUrl = `${baseUrl}/ceph/${path}${searchParams ? '?' + searchParams : ''}`;

  console.log(`[Ceph Proxy] ${request.method} -> ${backendUrl}`);

  const session = await auth();

  try {
    const fetchOptions = {
      method: request.method,
      headers: {
        ...(request.headers.get('Content-Type') && { 'Content-Type': request.headers.get('Content-Type') }),
        ...(session?.accessToken && { 'Authorization': `Bearer ${session.accessToken}` }),
      },
      cache: 'no-store',
      duplex: 'half',
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
      fetchOptions.body = request.body;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    const res = await fetch(backendUrl, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('Content-Type') || 'application/json';
    const responseBody = await res.arrayBuffer();

    return new NextResponse(responseBody, {
      status: res.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error(`[Ceph Proxy] Error fetching ${backendUrl}:`, error);
    const status = error.name === 'AbortError' ? 504 : 500;
    return NextResponse.json({ error: error?.message || 'Ceph proxy failed' }, { status });
  }
}

export { handleRequest as GET, handleRequest as POST, handleRequest as PUT, handleRequest as DELETE, handleRequest as PATCH };

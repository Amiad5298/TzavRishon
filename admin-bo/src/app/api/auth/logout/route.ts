import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');

  // Get the origin from the request headers for proper redirect
  const origin = request.headers.get('origin') || request.headers.get('host') || '';
  const protocol = origin.includes('localhost') ? 'http' : 'https';
  const baseUrl = origin.startsWith('http') ? origin : `${protocol}://${origin}`;

  return NextResponse.redirect(new URL('/login', baseUrl || 'http://localhost:3000'));
}


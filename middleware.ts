import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a simplified middleware for MVP
// In production, you would integrate with Stripe's subscription API
export function middleware(request: NextRequest) {
  // For MVP, we'll skip authentication checks
  // In production, you would:
  // 1. Check for authentication cookie/session
  // 2. Verify Stripe subscription status
  // 3. Redirect to payment page if not subscribed
  
  const isPro = request.cookies.get('is_pro')?.value === 'true';
  
  // For now, allow all requests through
  // To enable gating, uncomment below:
  /*
  if (!isPro && request.nextUrl.pathname.startsWith('/api/chat')) {
    return NextResponse.json(
      { error: 'Upgrade to Analyst Pro to access this feature' },
      { status: 403 }
    );
  }
  */
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

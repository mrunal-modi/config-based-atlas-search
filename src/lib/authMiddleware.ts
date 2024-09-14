// src/lib/authMiddleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function authMiddleware(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Add the user ID to the request object for easy access in route handlers
  (req as any).userId = session.user.sub;
  
  // Add the user email to the request object
  (req as any).userEmail = session.user.email;
  
  return NextResponse.next();
}
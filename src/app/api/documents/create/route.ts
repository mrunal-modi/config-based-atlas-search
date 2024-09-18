// Create new document
// /src/app/api/documents/create/route.ts

// POST: Creates a new document
// service: createDocument

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { authMiddleware } from '@/lib/authMiddleware';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { selectedDatabase, collection, document } = body;

  if (!selectedDatabase || !collection || !document) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { db } = await dbConnect(selectedDatabase);
    const coll = db.collection(collection);

    let userId: string | undefined;
    try {
      const authResponse = await authMiddleware(request);
      if (authResponse.status !== 401) {
        userId = (request as any).userId;
      }
    } catch (error) {
      console.log('Auth failed, unable to insert document');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentToInsert = {
      ...document,
      userId: userId,
      isPublic: document.isPublic == true || false
    };

    const result = await coll.insertOne(documentToInsert);

    return NextResponse.json({ 
      result: { 
        acknowledged: result.acknowledged,
        insertedId: result.insertedId
      }
    });
  } catch (error: any) {
    console.error('Error in insertOne API route:', error);
    return NextResponse.json({
      error: "An error occurred while inserting the document",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
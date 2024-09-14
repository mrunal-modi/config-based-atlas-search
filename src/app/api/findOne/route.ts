import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/dbConnect';
import { authMiddleware } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const selectedDatabase = searchParams.get('selectedDatabase');
  const collection = searchParams.get('collection');
  const idField = searchParams.get('idField') || '_id';
  const projection = searchParams.get('projection');
  const publicOnly = searchParams.get('publicOnly') === 'true';

  if (!id || !selectedDatabase || !collection) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { db } = await dbConnect(selectedDatabase);
    const coll = db.collection(collection);

    let filter: any = {};
    if (idField === '_id') {
      filter._id = new ObjectId(id);
    } else {
      filter[idField] = id;
    }

    let userId: string | undefined;
    if (!publicOnly) {
      try {
        const authResponse = await authMiddleware(request);
        if (authResponse.status !== 401) {
          userId = (request as any).userId;
        }
      } catch (error) {
        console.log('Auth failed, searching only public documents');
      }
    }

    if (userId) {
      filter.$or = [{ userId: userId }, { isPublic: true }];
    } else {
      filter.isPublic = true;
    }

    let projectionObj: any = {};
    if (projection) {
      projectionObj = projection.split(',').reduce((acc: any, field) => {
        acc[field] = 1;
        return acc;
      }, {});
    }

    const result = await coll.findOne(filter, { projection: projectionObj });

    if (!result) {
      return NextResponse.json({ error: "Document not found or you don't have permission to view it" }, { status: 404 });
    }

    // Remove userId and userEmail from result if the user is not authenticated
    if (!userId) {
      const { userId, userEmail, ...sanitizedResult } = result;
      return NextResponse.json({ result: sanitizedResult });
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error in findOne API route:', error);
    return NextResponse.json({
      error: "An error occurred while fetching the document",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/dbConnect';
import { authMiddleware } from '@/lib/authMiddleware';

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { selectedDatabase, collection, id } = body;

  if (!selectedDatabase || !collection || !id) {
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
      console.log('Auth failed, unable to delete document');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentFilter = { 
      _id: new ObjectId(id),
      $or: [{ userId: userId }, { isPublic: true }]
    };

    // First, check if the document exists and is accessible to the user
    const document = await coll.findOne(documentFilter);

    if (!document) {
      return NextResponse.json({ error: "Document not found or you don't have permission to delete it" }, { status: 404 });
    }

    // If the document is public but not owned by the user, don't allow deletion
    if (document.isPublic && document.userId !== userId) {
      return NextResponse.json({ error: "You don't have permission to delete this public document" }, { status: 403 });
    }

    // Perform the delete operation
    const result = await coll.deleteOne({ _id: new ObjectId(id), userId: userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete the document" }, { status: 500 });
    }

    return NextResponse.json({ 
      result: { 
        acknowledged: result.acknowledged,
        deletedCount: result.deletedCount
      }
    });
  } catch (error: any) {
    console.error('Error in deleteOne API route:', error);
    return NextResponse.json({
      error: "An error occurred while deleting the document",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { authMiddleware } from '@/lib/authMiddleware';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { selectedDatabase, collection, id, update } = body;

  if (!selectedDatabase || !collection || !id || !update) {
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
      console.log('Auth failed, unable to update document');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the user has permission to update this document
    const existingDoc = await coll.findOne({ _id: new ObjectId(id), userId: userId });
    if (!existingDoc) {
      return NextResponse.json({ error: "Document not found or you don't have permission to update it" }, { status: 404 });
    }

    // Prepare the update operation using $set
    const updateOperation = {
      $set: {
        ...update,
        userId: userId, // Ensure userId remains unchanged
        isPublic: update.isPublic == true || false // Update isPublic if provided, otherwise default to false
      }
    };

    // Remove _id from the update operation if present
    if (updateOperation.$set._id) {
      delete updateOperation.$set._id;
    }

    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      updateOperation
    );

    return NextResponse.json({ 
      result: { 
        acknowledged: result.acknowledged,
        modifiedCount: result.modifiedCount,
        upsertedId: result.upsertedId,
        upsertedCount: result.upsertedCount,
        matchedCount: result.matchedCount,
      }
    });
  } catch (error: any) {
    console.error('Error in updateOne API route:', error);
    return NextResponse.json({
      error: "An error occurred while updating the document",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
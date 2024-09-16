import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/dbConnect';
import { authMiddleware } from '@/lib/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const id = params.id;
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { selectedDatabase, collection, update } = body;
  const id = params.id;

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

    // Convert isPublic to boolean if it exists in the update
    if ('isPublic' in update) {
      update.isPublic = update.isPublic === true || update.isPublic === 'true';
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { selectedDatabase, collection } = body;
  const id = params.id;

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
// Individual document operations
// /src/app/api/documents/[id]/route.ts

// GET: Retrieves a single document
// PUT: Updates a document
// DELETE: Deletes a document
// services: getDocument, updateDocument, deleteDocument

import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/dbConnect';
import { authMiddleware } from '@/lib/authMiddleware';
import { generateSlug } from '@/utils/slugGenerator';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const selectedDatabase = searchParams.get('selectedDatabase');
  const collection = searchParams.get('collection');
  const idField = searchParams.get('idField') || '_id';
  const projection = searchParams.get('projection');

  if (!params.id || !selectedDatabase || !collection) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { db } = await dbConnect(selectedDatabase);
    const coll = db.collection(collection);

    let filter: any = {};
    if (idField === '_id') {
      filter._id = new ObjectId(params.id);
    } else {
      filter[idField] = params.id;
    }

    // First, try to find a public document
    let result = await coll.findOne({ ...filter, isPublic: true }, { projection: projection ? JSON.parse(projection) : {} });

    // If no public document is found, check for authentication and user-specific document
    if (!result) {
      const authResponse = await authMiddleware(request);
      if (authResponse.status === 401) {
        return NextResponse.json({ error: "Document not found or you don't have permission to view it" }, { status: 404 });
      }
      const userId = (request as any).userId;
      result = await coll.findOne({ ...filter, userId }, { projection: projection ? JSON.parse(projection) : {} });
    }

    if (!result) {
      return NextResponse.json({ error: "Document not found or you don't have permission to view it" }, { status: 404 });
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error in GET API route:', error);
    return NextResponse.json({ error: "An error occurred while fetching the document" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await authMiddleware(request);
  if (authResponse.status === 401) {
    return authResponse;
  }

  const body = await request.json();
  const { selectedDatabase, collection, update } = body;

  if (!selectedDatabase || !collection || !params.id || !update) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { db } = await dbConnect(selectedDatabase);
    const coll = db.collection(collection);
    const userId = (request as any).userId;

    const { _id, ...updateData } = update;

    if ('isPublic' in updateData) {
      updateData.isPublic = updateData.isPublic === true || updateData.isPublic === 'true';
      if (updateData.isPublic && !updateData.publicSlug) {
        updateData.publicSlug = await generateSlug(db, updateData.title || '');
      } else if (!updateData.isPublic) {
        updateData.publicSlug = null;
      }
    }

    const result = await coll.findOneAndUpdate(
      { _id: new ObjectId(params.id), userId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: "Document not found or you don't have permission to update it" }, { status: 404 });
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error in PUT API route:', error);
    return NextResponse.json({ error: "An error occurred while updating the document" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await authMiddleware(request);
  if (authResponse.status === 401) {
    return authResponse;
  }

  const { searchParams } = new URL(request.url);
  const selectedDatabase = searchParams.get('selectedDatabase');
  const collection = searchParams.get('collection');

  if (!selectedDatabase || !collection || !params.id) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { db } = await dbConnect(selectedDatabase);
    const coll = db.collection(collection);
    const userId = (request as any).userId;

    const result = await coll.deleteOne({ _id: new ObjectId(params.id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Document not found or you don't have permission to delete it" }, { status: 404 });
    }

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error: any) {
    console.error('Error in DELETE API route:', error);
    return NextResponse.json({ error: "An error occurred while deleting the document" }, { status: 500 });
  }
}

// Duplicate Doc
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await authMiddleware(request);
  if (authResponse.status === 401) {
    return authResponse;
  }

  const body = await request.json();
  const { selectedDatabase, collection, config } = body;

  if (!selectedDatabase || !collection || !params.id || !config) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const { db } = await dbConnect(selectedDatabase);
    const coll = db.collection(collection);
    const userId = (request as any).userId;

    const originalDocument = await coll.findOne({ _id: new ObjectId(params.id), userId });

    if (!originalDocument) {
      return NextResponse.json({ error: "Original document not found or you don't have permission to copy it" }, { status: 404 });
    }

    const { _id, ...documentToDuplicate } = originalDocument;

    // Determine the title field based on the config
    const titleField = config.searchResultsSuggestionsField || 'title';
    const originalTitle = documentToDuplicate[titleField] || 'Untitled';

    const newDocument = {
      ...documentToDuplicate,
      [titleField]: `${originalTitle} (COPY)`, // Add (COPY) to the title
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      publicSlug: undefined
    };

    const result = await coll.insertOne(newDocument);
    const insertedDocument = await coll.findOne({ _id: result.insertedId });
    
    return NextResponse.json({ result: insertedDocument });
  } catch (error: any) {
    console.error('Error in duplicateDocument API route:', error);
    return NextResponse.json({
      error: "An error occurred while duplicating the document",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
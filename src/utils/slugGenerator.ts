// src/utils/slugGenerator.ts

import { Db } from 'mongodb';

export async function generateSlug(db: Db, title: string): Promise<string> {
  // Convert the title to a slug
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  // Check if the slug already exists
  const slugExists = await db.collection('documents').findOne({ publicSlug: slug });

  if (!slugExists) {
    return slug;
  }

  // If the slug exists, add a number to the end
  let counter = 1;
  let newSlug = `${slug}-${counter}`;

  while (await db.collection('documents').findOne({ publicSlug: newSlug })) {
    counter++;
    newSlug = `${slug}-${counter}`;
  }

  return newSlug;
}

// Example usage:
// const slug = await generateSlug(db, "My Awesome Document");
// app/api/s3/[year]/route.ts
import { NextResponse } from 'next/server';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
} as const);

export async function GET(
  request: Request,
  { params }: { params: { year: string } }
) {
  console.log('Year-specific API route handler started');
  
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No valid authorization header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const folderPath = userDoc.data()?.folderPath || '';

    // Create the year-specific S3 prefix
    const yearPrefix = `${process.env.AWS_BASE_FOLDER}${folderPath}/${params.year}/`;
    console.log('Year-specific S3 prefix:', yearPrefix);

    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: yearPrefix,
      Delimiter: '/',
    });

    const response = await s3Client.send(command);
    console.log('S3 response received for year:', {
      prefixCount: response.CommonPrefixes?.length || 0,
      contentCount: response.Contents?.length || 0
    });

    const folders = (response.CommonPrefixes || [])
      .map(prefix => {
        if (!prefix.Prefix) return null;
        const folderName = prefix.Prefix.split('/').slice(-2)[0];
        return {
          name: folderName,
          path: prefix.Prefix,
        };
      })
      .filter(folder => folder !== null);

    console.log('Final folders data for year:', folders);
    
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      console.error({
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
    }
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
import { NextRequest,NextResponse } from 'next/server';
import { ListObjectsV2Command, S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
} as const);

export async function GET(
  request: NextRequest,
  context: { params: { year: string; time: string } }
) {
  try {
    const { params } = context;

    // Check authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Fetch user document from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const folderPath = userDoc.data()?.folderPath || '';

    // Define S3 prefix for the time period
    const timePrefix = `${process.env.AWS_BASE_FOLDER}${folderPath}/${params.year}/${params.time}/`;
    console.log('Time-specific S3 prefix:', timePrefix);

    // Fetch objects from S3
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: timePrefix,
    });

    const response = await s3Client.send(command);

    // Filter for image files and generate signed URLs
    const images = await Promise.all(
      (response.Contents || [])
        .filter(item => item.Key?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i))
        .map(async (item) => {
          const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: item.Key,
          });

          // Generate signed URL
          const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
            expiresIn: 3600, // 1 hour
          });

          return {
            key: item.Key,
            url: signedUrl,
            lastModified: item.LastModified,
          };
        })
    );

    // Sort images by last modified date (newest first)
    const sortedImages = images.sort((a, b) =>
      (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0)
    );

    console.log(`Found ${sortedImages.length} images in folder ${timePrefix}`);

    return NextResponse.json({
      images: sortedImages,
      prefix: timePrefix,
    });
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      console.error({
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });
    }
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
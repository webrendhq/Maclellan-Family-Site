// app/api/s3/[year]/[time]/route.ts
import { NextRequest, NextResponse } from 'next/server';
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
  }
}

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string; time: string } }
) {
  try {
    const { year, time } = params;
    
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
    const folderPath = userDoc.data()?.folderPath;

    // Construct the S3 path
    const cleanPath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath;
    const prefix = time === 'other' 
      ? `0 US/${cleanPath}/${year}/`
      : `0 US/${cleanPath}/${year}/${time}/`;

    // List objects in the folder
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET!,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);

    // Generate signed URLs for each image
    const images = await Promise.all(
      (response.Contents || [])
        .filter(item => {
          if (!item.Key) return false;
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(item.Key);
          if (time === 'other') {
            // For 'other', only include files directly in the year folder
            const itemPath = item.Key.replace(prefix, '');
            return isImage && !itemPath.includes('/');
          }
          return isImage; // For regular time folders, include all images
        })
        .map(async (item) => {
          const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: item.Key,
          });

          const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
            expiresIn: 3600,
          });

          return {
            key: item.Key,
            url: signedUrl,
            lastModified: item.LastModified?.toISOString(),
          };
        })
    );

    return NextResponse.json({
      images: images.sort((a, b) => 
        (new Date(b.lastModified || 0).getTime()) - 
        (new Date(a.lastModified || 0).getTime())
      ),
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
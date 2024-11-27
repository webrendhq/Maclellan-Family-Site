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

export async function GET(request: Request) {
  console.log('API route handler started');
  
  try {
    console.log('Environment check:', {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      hasAwsRegion: !!process.env.AWS_S3_REGION,
      hasAwsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasAwsSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasAwsBucket: !!process.env.AWS_S3_BUCKET
    });

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No valid authorization header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Got token, attempting verification');

    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log('Token verified for user:', userId);

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const folderPath = userDoc.data()?.folderPath || '';
    console.log('Retrieved folder path:', folderPath);

    const s3Prefix = `${process.env.AWS_BASE_FOLDER}${folderPath}/`;
    console.log('S3 prefix:', s3Prefix);

    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: s3Prefix,
      Delimiter: '/',
    });

    const response = await s3Client.send(command);
    console.log('S3 response received:', {
      prefixCount: response.CommonPrefixes?.length || 0,
      contentCount: response.Contents?.length || 0
    });

    const folderPromises = (response.CommonPrefixes || []).map(async (prefix) => {
      if (!prefix.Prefix) return null;
      
      const folderName = prefix.Prefix.split('/').slice(-2)[0];
      console.log(`\nProcessing folder: ${folderName}`);
      
      const yearContents = await s3Client.send(new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: prefix.Prefix,
        Delimiter: ''
      }));

      const images = yearContents.Contents?.filter(item => 
        item.Key?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)
      ).map(item => item.Key) || [];

      let backgroundUrl = null;
      if (images.length > 0) {
        const randomImageKey = images[Math.floor(Math.random() * images.length)];
        if (randomImageKey) {
          console.log(`Selected image key for ${folderName}:`, randomImageKey);
          
          const encodedKey = randomImageKey.split('/').map(part => 
            encodeURIComponent(part)
          ).join('/');
          
          backgroundUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${encodedKey}`;
          console.log(`Generated URL for ${folderName}:`, backgroundUrl);
        }
      }

      return {
        name: folderName,
        backgroundUrl,
        totalImages: images.length
      };
    });

    const folders = (await Promise.all(folderPromises))
      .filter(folder => folder !== null)
      .sort((a, b) => parseInt(a!.name) - parseInt(b!.name));

    console.log('\nFinal folders data:', 
      folders.map(f => ({
        name: f?.name,
        hasUrl: !!f?.backgroundUrl,
        urlPreview: f?.backgroundUrl ? `${f.backgroundUrl.substring(0, 50)}...` : 'none'
      }))
    );
    
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
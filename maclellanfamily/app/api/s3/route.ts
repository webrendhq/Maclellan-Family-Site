import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from '@/api/firebase/admin';
import { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  console.log('Auth header present:', !!authHeader);

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log('Token verified for user:', decodedToken.uid);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid authentication token');
  }
}

async function getUserFolderPath(userId: string): Promise<string> {
  console.log('Attempting to fetch user document for ID:', userId);
  
  let userDoc: DocumentSnapshot<DocumentData>;
  try {
    userDoc = await adminDb.collection('users').doc(userId).get();
    console.log('Firestore response:', {
      exists: userDoc.exists,
      path: userDoc.ref.path,
      documentId: userDoc.id
    });
  } catch (error) {
    console.error('Firestore error:', error);
    throw new Error('Failed to fetch user data');
  }

  if (!userDoc.exists) {
    throw new Error('User document not found');
  }

  const userData = userDoc.data();
  const folderPath = userData?.folderPath;
  console.log('Found folderPath:', folderPath);

  if (!folderPath) {
    throw new Error('Folder path not found for user');
  }

  return folderPath;
}

async function getPresignedUrl(bucket: string, key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}

async function getRandomImageFromFolder(bucket: string, folderPrefix: string): Promise<string | null> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: folderPrefix,
    });

    const response = await s3.send(command);
    
    const imageFiles = (response.Contents?.filter(file => {
      const extension = file.Key?.toLowerCase().split('.').pop();
      return extension && VALID_IMAGE_EXTENSIONS.includes(extension);
    }) ?? []);

    if (imageFiles.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * imageFiles.length);
    const randomImage = imageFiles[randomIndex];

    if (!randomImage.Key) return null;

    return await getPresignedUrl(bucket, randomImage.Key);
  } catch (error) {
    console.error('Error getting random image:', error);
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const decodedToken = await verifyAuth(request);
    const userId = decodedToken.uid;

    const folderPath = await getUserFolderPath(userId);
    const cleanPath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath;
    const s3Prefix = `0 US/${cleanPath}/`;

    const { searchParams } = new URL(request.url);
    const specificFolder = searchParams.get('folder');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (specificFolder) {
      if (!/^[\w-]+$/.test(specificFolder)) {
        return NextResponse.json(
          { error: 'Invalid folder name' },
          { status: 400 }
        );
      }

      const folderPrefix = `${s3Prefix}${specificFolder}/`;
      console.log('Fetching images from folder:', folderPrefix);
      
      try {
        const command = new ListObjectsV2Command({
          Bucket: process.env.AWS_S3_BUCKET!,
          Prefix: folderPrefix,
        });

        const response = await s3.send(command);
        
        const imageFiles = (response.Contents?.filter(file => {
          const extension = file.Key?.toLowerCase().split('.').pop();
          return extension && VALID_IMAGE_EXTENSIONS.includes(extension);
        }) ?? []).sort((a, b) => {
          const aName = a.Key?.split('/').pop() || '';
          const bName = b.Key?.split('/').pop() || '';
          return aName.localeCompare(bName);
        });

        if (imageFiles.length === 0) {
          return NextResponse.json(
            { error: 'No images found in folder' },
            { status: 404 }
          );
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedFiles = imageFiles.slice(startIndex, endIndex);

        const signedUrls = await Promise.all(
          paginatedFiles.map(async (file) => {
            if (!file.Key) return null;
            return {
              url: await getPresignedUrl(process.env.AWS_S3_BUCKET!, file.Key),
              key: file.Key.split('/').pop()
            };
          })
        );

        return NextResponse.json({
          images: signedUrls.filter(Boolean),
          totalImages: imageFiles.length,
          currentPage: page,
          totalPages: Math.ceil(imageFiles.length / limit)
        });
      } catch (s3Error) {
        console.error('S3 error while fetching images:', s3Error);
        return NextResponse.json(
          { error: 'Failed to fetch images from S3' },
          { status: 500 }
        );
      }
    } else {
      console.log('Using S3 prefix for folder listing:', s3Prefix);
      
      try {
        const command = new ListObjectsV2Command({
          Bucket: process.env.AWS_S3_BUCKET!,
          Prefix: s3Prefix,
          Delimiter: '/',
        });

        const response = await s3.send(command);
        
        const folders = response.CommonPrefixes
          ?.map(prefix => prefix.Prefix?.slice(s3Prefix.length, -1))
          .filter((folder): folder is string => folder !== undefined) ?? [];

        const foldersWithThumbnails = await Promise.all(
          folders.map(async (folder) => {
            const folderPrefix = `${s3Prefix}${folder}/`;
            const thumbnailUrl = await getRandomImageFromFolder(process.env.AWS_S3_BUCKET!, folderPrefix);
            return {
              name: folder,
              thumbnailUrl
            };
          })
        );
        
        return NextResponse.json({ folders: foldersWithThumbnails });
      } catch (s3Error) {
        console.error('S3 query failed:', s3Error);
        return NextResponse.json(
          { error: 'Failed to fetch folders from S3' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    
    const status = error instanceof Error
      ? error.message.includes('auth') 
        ? 401 
        : error.message.includes('not found')
          ? 404
          : 500
      : 500;
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const decodedToken = await verifyAuth(request);
    const userId = decodedToken.uid;

    const folderPath = await getUserFolderPath(userId);
    const cleanPath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath;
    const s3Prefix = `0 US/${cleanPath}/`;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!folder) {
      return NextResponse.json({ error: 'No folder specified' }, { status: 400 });
    }

    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!fileExtension || !VALID_IMAGE_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: `${s3Prefix}${folder}/${file.name}`, // Add folder to the path
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upload error:', error);
    
    const status = error instanceof Error
      ? error.message.includes('auth') 
        ? 401 
        : error.message.includes('not found')
          ? 404
          : 500
      : 500;
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status }
    );
  }
}
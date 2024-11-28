// // utils/s3-client.ts
// 'use client';

// import { S3Client } from '@aws-sdk/client-s3';

// if (!process.env.NEXT_PUBLIC_AWS_S3_REGION ||
//     !process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ||
//     !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY) {
//     throw new Error('Missing required AWS environment variables');
// }

// export const s3Client = new S3Client({
//     region: process.env.NEXT_PUBLIC_AWS_S3_REGION as string,
//     credentials: {
//         accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
//         secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
//     },
// });
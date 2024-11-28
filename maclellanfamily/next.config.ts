import { NextConfig } from 'next'

const config: NextConfig = {
//  basePath: process.env.NODE_ENV === 'production' ? '/MaclellanFamily.com' : '',
 output: 'standalone',
 images: {
   unoptimized: true,
   domains: [],
 },
 
 typescript: {
   ignoreBuildErrors: true,
 }
}

export default config
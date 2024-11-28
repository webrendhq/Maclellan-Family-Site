'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../api/firebase/firebase';
import { ChevronLeft, ChevronRight, Heart, Star, Smile, Coffee, Camera, Music, X, LucideIcon } from 'lucide-react';
import Image from 'next/image';


interface ImageData {
  key: string;
  url: string;
  lastModified: string;
}

interface ModalProps {
  image: ImageData | null;
  onClose: () => void;
}

interface PageProps {
  images: ImageData[];
  isRight?: boolean;
  isFlipping?: boolean;
  zIndex?: number;
  isMobile?: boolean;
  layouts?: string[];
  onImageClick: (image: ImageData, index: number) => void;
}

interface Sticker {
  icon: LucideIcon;
  color: string;
}

interface PageLayout {
  imageCount: number;
  layouts: string[];
}

interface PageLayouts {
  [pageIndex: number]: PageLayout;
}

const layoutTypes = [
  'col-span-4 row-span-4', // Full page
  'col-span-4 row-span-2', // Full width
  'col-span-2 row-span-4', // Full height
  'col-span-2 row-span-2', // Quarter page
] as const;

const mobileLayoutTypes = [
  'col-span-2 row-span-3', // Full mobile page
  'col-span-2 row-span-2', // Full width
  'col-span-1 row-span-2', // Half height
  'col-span-1 row-span-1', // Quarter
] as const;

const stickers: Sticker[] = [
  { icon: Heart, color: "text-red-500" },
  { icon: Star, color: "text-yellow-500" },
  { icon: Smile, color: "text-yellow-500" },
  { icon: Coffee, color: "text-brown-500" },
  { icon: Camera, color: "text-blue-500" },
  { icon: Music, color: "text-purple-500" }
];

const rotations = [-3, -2, -1, 0, 1, 2, 3] as const;

const getRandomImageCount = () => Math.floor(Math.random() * 4) + 2; // Random number between 2 and 5

// Image Modal Component
const ImageModal: React.FC<ModalProps> = ({ image, onClose }) => {
    if (!image) return null;
  
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
        onClick={onClose}
      >
        <div 
          className="relative max-w-7xl w-full h-full flex items-center justify-center"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
          <div className="relative w-full h-full">
            <Image
                src={image.url}
                alt="Full size view"
                fill
                className="object-contain rounded-lg shadow-2xl"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
            />
            </div>
        </div>
      </div>
    );
  };
  
  // Blank Page Component
  const BlankPage: React.FC<{ isRight?: boolean }> = ({ isRight }) => (
    <div 
      className={`
        absolute inset-0
        w-full h-full
        bg-[#fff8e7]
        shadow-lg
        ${isRight ? 'origin-left' : 'origin-right'}
      `}
      style={{ 
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="relative w-full h-full p-4 md:p-8">
        <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 bottom-2 md:bottom-4 border-4 border-dashed border-[#d4c4a8] opacity-30" />
      </div>
    </div>
  );
  
  // Helper function for optimal layout
  const getOptimalLayout = (imageCount: number, isMobile: boolean) => {
    switch (imageCount) {
      case 2:
        return Array(2).fill(isMobile ? mobileLayoutTypes[0] : layoutTypes[1]);
      case 3:
        if (isMobile) {
          return [
            mobileLayoutTypes[1], // Top image
            mobileLayoutTypes[3], // Bottom left
            mobileLayoutTypes[3], // Bottom right
          ];
        }
        return [
          layoutTypes[1], // Large top
          layoutTypes[3], // Bottom left
          layoutTypes[3], // Bottom right
        ];
      case 4:
        if (isMobile) {
          return [
            mobileLayoutTypes[1], // Top
            mobileLayoutTypes[3], // Middle left
            mobileLayoutTypes[3], // Middle right
            mobileLayoutTypes[1], // Bottom
          ];
        }
        return Array(4).fill(layoutTypes[3]); // Four equal quarters
      // case 5:
      //   if (isMobile) {
      //     return [
      //       mobileLayoutTypes[1], // Top
      //       mobileLayoutTypes[3], // Middle left
      //       mobileLayoutTypes[3], // Middle right
      //       mobileLayoutTypes[3], // Bottom left
      //       mobileLayoutTypes[3], // Bottom right
      //     ];
      //   }
      //   return [
      //     layoutTypes[1], // Top full width
      //     layoutTypes[3], // Bottom left
      //     layoutTypes[2], // Bottom middle
      //     layoutTypes[3], // Bottom right top
      //     layoutTypes[3], // Bottom right bottom
      //   ];
      default:
        return Array(imageCount).fill(isMobile ? mobileLayoutTypes[3] : layoutTypes[3]);
    }
  };

  const ScrapbookPage: React.FC<PageProps> = ({
    images,
    isRight = false,
    isFlipping = false,
    zIndex = 1,
    isMobile = false,
    layouts,
    onImageClick
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const pageLayouts = layouts || getOptimalLayout(images.length, isMobile);
  
    useEffect(() => {
      setIsLoaded(false);
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }, [images]);
  
    return (
      <div 
        className={`
          absolute inset-0
          w-full h-full
          bg-[#fff8e7]
          shadow-lg
          ${isRight ? 'origin-left' : 'origin-right'}
          ${isFlipping ? isRight ? 'page-flip-right' : 'page-flip-left' : ''}
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ 
          zIndex,
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="relative w-full h-full p-4 md:p-8 overflow-hidden">
          <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 bottom-2 md:bottom-4 border-4 border-dashed border-[#d4c4a8] opacity-30" />
          
          <div className="h-full">
            <div className={`grid ${isMobile ? 'grid-cols-2 grid-rows-3' : 'grid-cols-4 grid-rows-4'} gap-2 md:gap-4 h-full`}>
              {images.map((image, index) => {
                const layout = pageLayouts[index];
                const rotation = rotations[Math.floor(Math.random() * rotations.length)];
                
                return (
                  <div
                    key={image.key}
                    className={`
                      relative
                      ${layout}
                      group
                      bg-white
                      p-2 md:p-3
                      shadow-md
                      hover:shadow-xl
                      transition-all
                      duration-300
                      transform-gpu
                      cursor-pointer
                    `}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                    }}
                    onClick={() => onImageClick(image, index)}
                  >
                    <div className="relative w-full h-full">
                        <Image
                            src={image.url}
                            alt={`Memory ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 25vw"
                        />
                    </div>
                    {Math.random() > 0.5 && (
                      <div 
                        className="absolute"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                      >
                        {(() => {
                          const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
                          const StickerIcon = randomSticker.icon;
                          return <StickerIcon className={`${randomSticker.color} fill-current`} size={isMobile ? 16 : 24} />;
                        })()}
                      </div>
                    )}
                    <div className="absolute -top-2 -left-2 w-4 md:w-8 h-4 md:h-8 bg-[#ffffffaa] rotate-45 transform origin-bottom-right" />
                    <div className="absolute -top-2 -right-2 w-4 md:w-8 h-4 md:h-8 bg-[#ffffffaa] -rotate-45 transform origin-bottom-left" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
  
        <div 
          className="absolute inset-0 w-full h-full bg-[#fff8e7]"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        />
      </div>
    );
  };

  export default function TimePage() {
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [pageLayouts, setPageLayouts] = useState<PageLayouts>({});
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const params = useParams();
    const { year, time } = params;
  
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768 || window.innerHeight < 600);
      };
  
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setLoading(false);
          return;
        }
  
        try {
          const token = await user.getIdToken();
          const response = await fetch(`/api/s3/${year}/${time}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch images');
          }
  
          const data = await response.json();
          setImages(data.images);
        } catch (error) {
          console.error('Error fetching images:', error);
        } finally {
          setLoading(false);
        }
      });
  
      return () => unsubscribe();
    }, [year, time]);
  
    const getOrCreatePageLayout = useCallback((pageIndex: number, availableImages: ImageData[]) => {
      if (pageLayouts[pageIndex]) {
        return pageLayouts[pageIndex];
      }
  
      const imageCount = Math.min(getRandomImageCount(), availableImages.length);
      const layouts = getOptimalLayout(imageCount, isMobile);
      
      const newLayout = { imageCount, layouts };
      setPageLayouts(prev => ({ ...prev, [pageIndex]: newLayout }));
      return newLayout;
    }, [isMobile, pageLayouts]);
  
    const getCurrentPageImages = useCallback((pageIndex: number) => {
      let startIndex = 0;
      for (let i = 0; i < pageIndex; i++) {
        if (pageLayouts[i]) {
          startIndex += pageLayouts[i].imageCount;
        }
      }
      
      const layout = getOrCreatePageLayout(pageIndex, images.slice(startIndex));
      return images.slice(startIndex, startIndex + layout.imageCount);
    }, [images, pageLayouts, getOrCreatePageLayout]);
  
    const calculateTotalPages = useCallback(() => {
      let totalImages = 0;
      let pageCount = 0;
      
      while (totalImages < images.length) {
        const currentPageLayout = pageLayouts[pageCount] || 
          { imageCount: Math.min(getRandomImageCount(), images.length - totalImages) };
        totalImages += currentPageLayout.imageCount;
        pageCount++;
      }
      
      return Math.ceil(pageCount / (isMobile ? 1 : 2));
    }, [images.length, isMobile, pageLayouts]);
  
    const handleImageClick = (image: ImageData) => {
      setSelectedImage(image);
    };
  
    const handleCloseModal = () => {
      setSelectedImage(null);
    };
  
    const handlePageTurn = (direction: 'next' | 'prev') => {
      if (isFlipping) return;
      
      setFlipDirection(direction);
      setIsFlipping(true);
  
      setTimeout(() => {
        if (direction === 'next') {
          setCurrentPage(prev => Math.min(totalPages - (isMobile ? 1 : 2), prev + (isMobile ? 1 : 2)));
        } else {
          setCurrentPage(prev => Math.max(0, prev - (isMobile ? 1 : 2)));
        }
        setIsFlipping(false);
        setFlipDirection(null);
      }, 800); // Matches animation duration
    };
  
    const totalPages = calculateTotalPages();
  
    if (loading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
  
    return (
      <div className="min-h-screen bg-[#8b7355] p-4 md:p-8">
        <div className="max-w-[1800px] mx-auto">
          <div className={`relative ${isMobile ? 'aspect-[1/1.4]' : 'aspect-[2/1.4]'} bg-[#654321] rounded-lg shadow-2xl p-4 md:p-8 perspective-[2000px]`}>
            {!isMobile && (
              <div className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4 bg-[#463025] shadow-inner" />
            )}
            
            <div className="relative h-full overflow-hidden book-pages">
              {!isMobile && (
                <>
                  <div className="absolute left-0 w-1/2 h-full">
                    <BlankPage />
                  </div>
                  <div className="absolute right-0 w-1/2 h-full">
                    <BlankPage isRight />
                  </div>
                </>
              )}
  
              {isMobile ? (
                <div className="absolute inset-0">
                  <ScrapbookPage 
                    images={getCurrentPageImages(currentPage)}
                    isFlipping={isFlipping}
                    zIndex={2}
                    isMobile={true}
                    layouts={pageLayouts[currentPage]?.layouts}
                    onImageClick={handleImageClick}
                  />
                </div>
              ) : (
                <>
                  <div className="absolute left-0 w-1/2 h-full">
                    <ScrapbookPage 
                      images={getCurrentPageImages(currentPage)}
                      isFlipping={isFlipping && flipDirection === 'prev'}
                      zIndex={flipDirection === 'prev' ? 3 : 2}
                      layouts={pageLayouts[currentPage]?.layouts}
                      onImageClick={handleImageClick}
                    />
                  </div>
                  <div className="absolute right-0 w-1/2 h-full">
                    <ScrapbookPage 
                      images={getCurrentPageImages(currentPage + 1)}
                      isRight
                      isFlipping={isFlipping && flipDirection === 'next'}
                      zIndex={flipDirection === 'next' ? 3 : 2}
                      layouts={pageLayouts[currentPage + 1]?.layouts}
                      onImageClick={handleImageClick}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
  
          <div className="flex justify-center mt-4 md:mt-8 space-x-4 md:space-x-8">
            <button
              onClick={() => handlePageTurn('prev')}
              disabled={currentPage === 0 || isFlipping}
              className="px-4 md:px-6 py-2 md:py-3 bg-[#463025] text-white rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={isMobile ? 20 : 24} />
            </button>
            <button
              onClick={() => handlePageTurn('next')}
              disabled={currentPage >= totalPages - (isMobile ? 1 : 2) || isFlipping}
              className="px-4 md:px-6 py-2 md:py-3 bg-[#463025] text-white rounded-lg disabled:opacity-50"
            >
              <ChevronRight size={isMobile ? 20 : 24} />
            </button>
          </div>
        </div>
  
        {selectedImage && (
          <ImageModal
            image={selectedImage}
            onClose={handleCloseModal}
          />
        )}
  
        <style jsx global>{`
          .page-flip-right {
            animation: flipRight 0.8s ease-in-out;
            transform-origin: left;
            perspective: 2000px;
          }
  
          .page-flip-left {
            animation: flipLeft 0.8s ease-in-out;
            transform-origin: right;
            perspective: 2000px;
          }
  
          @keyframes flipRight {
            0% {
              transform: rotateY(0deg);
              z-index: 3;
            }
            100% {
              transform: rotateY(-180deg);
              z-index: 3;
            }
          }
  
          @keyframes flipLeft {
            0% {
              transform: rotateY(0deg);
              z-index: 3;
            }
            100% {
              transform: rotateY(180deg);
              z-index: 3;
            }
          }
        `}</style>
      </div>
    );
  }
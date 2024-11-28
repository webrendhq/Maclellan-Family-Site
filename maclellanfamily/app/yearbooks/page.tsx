'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../api/firebase/firebase';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface FolderData {
  name: string;
  backgroundUrl: string | null;
}

interface Position {
  x: number;
  y: number;
}

interface ModalProps {
  folder: FolderData;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onBrowse: (folderName: string) => void;
}
 
const BookCover: React.FC<{ folder: FolderData }> = ({ folder }) => (
  <div className="book-container w-48 h-64 perspective-1000">
    <div className="book relative w-full h-full transform-style-3d transition-transform duration-500 ease-in-out hover:rotate-y-10">
      {/* Book spine */}
      <div className="absolute left-0 top-0 w-8 h-full bg-blue-900 transform origin-left rotate-y-90 shadow-lg" />
      
      {/* Front cover */}
      <div className="absolute inset-0 backface-hidden">
        <div className="w-full h-full bg-blue-800 shadow-xl rounded-r-md border-r-8 border-blue-900">
          {folder.backgroundUrl ? (
            <div className="relative w-40 h-40 mx-auto mt-4 border-4 border-gold shadow-md">
              <Image
                src={folder.backgroundUrl}
                alt={`${folder.name} cover`}
                fill
                sizes="160px"
                className="object-cover rounded-sm"
                quality={60}
                priority
              />
            </div>
          ) : (
            <div className="w-40 h-40 mx-auto mt-4 bg-gray-200 border-4 border-gold shadow-md rounded-sm" />
          )}
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold text-gold font-serif">{folder.name}</h2>
            <p className="text-sm text-gold/80 mt-1">Yearbook</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Modal: React.FC<ModalProps> = ({
  folder,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onBrowse,
}) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPrev, onNext, onClose, hasPrev, hasNext]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 relative animate-modalSlideIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center justify-between space-x-4">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`p-2 rounded-full transition-all ${
              hasPrev ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300'
            }`}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex-1 flex flex-col items-center">
            <BookCover folder={folder} />
            <button
              onClick={() => onBrowse(folder.name)}
              className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
            >
              Browse
            </button>
          </div>
          
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`p-2 rounded-full transition-all ${
              hasNext ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300'
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<User | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });


  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.classList.add('animate-fadeIn');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User is logged in:", user);
    }
    const fetchFolders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
  
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/s3', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }
  
        const data = await response.json();
        setFolders(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching folders:', error.message);
        } else {
          console.error('Unknown error fetching folders:', error);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchFolders();
  }, [user]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !gridRef.current || !containerRef.current) return;

    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    setPosition({ x: newX, y: newY });

    const containerRect = containerRef.current.getBoundingClientRect();
    const folders = gridRef.current.children;
    const edgeThreshold = 200;

    Array.from(folders).forEach((folder) => {
      const folderRect = folder.getBoundingClientRect();
      const folderCenter = {
        x: folderRect.left + folderRect.width / 2,
        y: folderRect.top + folderRect.height / 2,
      };

      const distanceLeft = folderCenter.x - containerRect.left;
      const distanceRight = containerRect.right - folderCenter.x;
      const distanceTop = folderCenter.y - containerRect.top;
      const distanceBottom = containerRect.bottom - folderCenter.y;

      const minDistance = Math.min(
        distanceLeft,
        distanceRight,
        distanceTop,
        distanceBottom
      );

      let scale = 1;
      if (minDistance < edgeThreshold) {
        scale = Math.max(0, minDistance / edgeThreshold);
      }

      (folder as HTMLElement).style.transform = `
        rotate(45deg)
        scale(${scale})
      `;
    });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(false);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    
    setTimeout(() => {
      if (e.buttons === 1) {
        setIsDragging(true);
      }
    }, 100);
  };
  

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFolderClick = (index: number) => {
    if (!isDragging) {
      setSelectedIndex(index);
    }
  };

  const handleBrowse = (folderName: string) => {
    router.push(`/yearbooks/${folderName}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <div 
        ref={containerRef}
        className="fixed inset-0 bg-gray-100 overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 absolute"
          style={{
            padding: '120px',
            transform: `rotate(-45deg) translate(${position.x}px, ${position.y}px)`,
            transition: 'transform 0.05s ease-out',
          }}
        >
          {folders.map((folder, index) => (
            <div
              key={folder.name}
              onClick={() => handleFolderClick(index)}
              className="transform rotate-45 transition-all duration-300 ease-out hover:z-10 hover:scale-105"
              style={{
                margin: '24px',
                gridRow: `span ${Math.floor(index / 2) + 1}`,
              }}
            >
              <BookCover folder={folder} />
            </div>
          ))}
        </div>
      </div>

      {selectedIndex !== null && (
        <Modal
          folder={folders[selectedIndex]}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => setSelectedIndex(prev => Math.max(0, prev! - 1))}
          onNext={() => setSelectedIndex(prev => Math.min(folders.length - 1, prev! + 1))}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < folders.length - 1}
          onBrowse={handleBrowse}
        />
      )}
    </>
  );
}
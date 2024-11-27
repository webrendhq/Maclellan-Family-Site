'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../api/firebase/firebase';
import { Book, ChevronLeft, ChevronRight } from 'lucide-react';

interface FolderData {
  name: string;
  path: string;
}

export default function YearPage() {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const itemsPerPage = 10;
  const params = useParams();
  const router = useRouter();
  const year = params.year;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/s3/${year}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }

        const data = await response.json();
        setFolders(data);
        // Trigger animations after data is loaded
        setTimeout(() => setIsVisible(true), 100);
      } catch (error) {
        console.error('Error fetching folders:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [year]);

  useEffect(() => {
    // Reset visibility state when page changes
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 100);
  }, [currentPage]);

  const handleFolderClick = (folderName: string) => {
    router.push(`/yearbooks/${year}/${folderName}`);
  };

  // Pagination calculations
  const totalPages = Math.ceil(folders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFolders = folders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading contents...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Animated Header */}
        <div className={`text-center mb-16 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-center mb-4">
            <Book className="w-16 h-16 text-amber-800" />
          </div>
          <h1 className="text-5xl font-serif mb-4 text-amber-900">
            {year} Yearbook
          </h1>
          <div className="text-lg text-amber-800 italic">Table of Contents</div>
          <div className="mt-4 w-32 h-1 bg-amber-800 mx-auto"></div>
        </div>

        {/* Table of Contents with Staggered Animation */}
        <div className="bg-white rounded-lg shadow-xl p-12 font-serif">
          <div className="space-y-8">
            {currentFolders.map((folder, index) => (
              <div 
                key={folder.name} 
                className={`
                  flex items-baseline group
                  transition-all duration-500 transform
                  ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex-grow border-b-2 border-dotted border-amber-200 mb-1"></div>
                <div 
                  onClick={() => handleFolderClick(folder.name)}
                  className="flex items-baseline cursor-pointer group-hover:text-amber-800 transition-colors"
                >
                  <span className="text-2xl mr-4 text-amber-900">
                    {(startIndex + index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-xl capitalize">
                    {folder.name.replace(/-/g, ' ')}
                  </span>
                  <span className="ml-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Animated Pagination Controls */}
          {totalPages > 1 && (
            <div className={`
              mt-12 flex justify-center items-center gap-2
              transition-all duration-700 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
              style={{ transitionDelay: `${currentFolders.length * 100 + 200}ms` }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full hover:bg-amber-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-5 h-5 text-amber-800" />
              </button>
              
              {getPageNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                  disabled={pageNum === '...'}
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-full
                    ${pageNum === currentPage 
                      ? 'bg-amber-800 text-white' 
                      : 'text-amber-800 hover:bg-amber-50'}
                    ${pageNum === '...' ? 'cursor-default' : 'cursor-pointer'}
                    font-serif text-lg transition-colors
                  `}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full hover:bg-amber-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-5 h-5 text-amber-800" />
              </button>
            </div>
          )}
        </div>

        {/* Animated Footer */}
        <div className={`
          mt-8 text-center text-amber-800/60 font-serif italic
          transition-all duration-700 transform
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
          style={{ transitionDelay: `${currentFolders.length * 100 + 400}ms` }}
        >
          ❦
        </div>
      </div>
    </div>
  );
}
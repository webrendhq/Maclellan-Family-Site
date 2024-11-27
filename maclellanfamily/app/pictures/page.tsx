"use client";

import { useState, useEffect } from "react";
import { auth } from "../api/firebase/firebase"; // Adjust path if necessary
import AWS from "aws-sdk"; // Ensure AWS SDK is installed

interface Image {
  key: string;
  signedUrl?: string;
  thumbnailUrl?: string;
}

const PicturesPage: React.FC = () => {
  const [allImages, setAllImages] = useState<Image[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [imagesPerGrid, setImagesPerGrid] = useState<number>(4);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalImage, setModalImage] = useState<Image | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const S3_BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET as string;
  const BASE_FOLDER = process.env.NEXT_PUBLIC_AWS_BASE_FOLDER as string;
  const URL_EXPIRATION = parseInt(process.env.NEXT_PUBLIC_URL_EXPIRATION as string);

  // Fetch AWS credentials (placeholder logic, replace with your backend call)
  const getS3Client = async (): Promise<AWS.S3> => {
    const credentials = await fetch("/api/s3-credentials").then((res) => res.json());
    AWS.config.update({
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      region: credentials.region,
    });
    return new AWS.S3();
  };

  // Handle modal navigation
  const handleModalClose = () => setModalImage(null);
  const showPrevImage = () => {
    const currentIndex = allImages.findIndex((img) => img.key === modalImage?.key);
    if (currentIndex > 0) {
      setModalImage(allImages[currentIndex - 1]);
    }
  };
  const showNextImage = () => {
    const currentIndex = allImages.findIndex((img) => img.key === modalImage?.key);
    if (currentIndex < allImages.length - 1) {
      setModalImage(allImages[currentIndex + 1]);
    }
  };

  // Fetch images for the current page
  const loadImagesForCurrentPage = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const startIndex = (currentPage - 1) * imagesPerGrid;
      const endIndex = startIndex + imagesPerGrid;
      const pageImages = allImages.slice(startIndex, endIndex);

      const s3Client = await getS3Client();
      const updatedImages = await Promise.all(
        pageImages.map(async (image) => {
          if (!image.signedUrl) {
            const signedUrl = await s3Client.getSignedUrlPromise("getObject", {
              Bucket: S3_BUCKET,
              Key: image.key,
              Expires: URL_EXPIRATION,
            });
            return { ...image, signedUrl };
          }
          return image;
        })
      );

      setAllImages((prevImages) => [
        ...prevImages.slice(0, startIndex),
        ...updatedImages,
        ...prevImages.slice(endIndex),
      ]);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error loading images:", error);
      setErrorMessage("Failed to load images.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize gallery
  const initializeGallery = async (folderPath: string, year: string, event: string) => {
    try {
      const s3Client = await getS3Client();
      const normalizedPath = folderPath.replace(/^\//, "");
      const prefix = event === "Other"
        ? `${BASE_FOLDER}/${normalizedPath}/${year}/`
        : `${BASE_FOLDER}/${normalizedPath}/${year}/${event}/`;

      const { Contents } = await s3Client.listObjectsV2({ Bucket: S3_BUCKET, Prefix: prefix }).promise();
      const images = (Contents || [])
        .filter((item) => /\.(jpg|jpeg|png)$/i.test(item.Key || ""))
        .map((item) => ({ key: item.Key! }));

      setAllImages(images);
      setCurrentPage(1);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error initializing gallery:", error);
      setErrorMessage("Failed to initialize gallery.");
    }
  };

  // Monitor window width for layout changes
  useEffect(() => {
    const handleResize = () => {
      setImagesPerGrid(window.innerWidth >= 1500 ? 8 : 4);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Initialize gallery on auth state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const folderPath = sessionStorage.getItem("folderPath") || "default-folder";
        const year = "2023"; // Replace with query param or dynamic value
        const event = "Event1"; // Replace with query param or dynamic value
        initializeGallery(folderPath, year, event);
      } else {
        window.location.href = "/"; // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}

      <div className="camera">
        <div className="scrapbook bg-white shadow-lg rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4" id="images-gallery">
            {allImages
              .slice((currentPage - 1) * imagesPerGrid, currentPage * imagesPerGrid)
              .map((image) => (
                <div
                  key={image.key}
                  className="image-container bg-cover bg-center cursor-pointer"
                  style={{ backgroundImage: `url(${image.signedUrl || ""})` }}
                  onClick={() => setModalImage(image)}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalImage && (
        <div className="modal fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="relative">
            <button
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={handleModalClose}
            >
              &times;
            </button>
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl"
              onClick={showPrevImage}
              disabled={allImages.findIndex((img) => img.key === modalImage.key) === 0}
            >
              &#10094;
            </button>
            <img
              src={modalImage.signedUrl}
              alt="Modal Preview"
              className="max-w-full max-h-screen"
            />
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl"
              onClick={showNextImage}
              disabled={allImages.findIndex((img) => img.key === modalImage.key) === allImages.length - 1}
            >
              &#10095;
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination flex justify-center mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">{`Page ${currentPage} of ${Math.ceil(allImages.length / imagesPerGrid)}`}</span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage >= Math.ceil(allImages.length / imagesPerGrid) || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PicturesPage;

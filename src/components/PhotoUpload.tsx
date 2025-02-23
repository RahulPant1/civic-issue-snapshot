
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  onPhotoSelect: (file: File, metadata: any) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoSelect }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const extractExifData = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    // In a real app, we would use a proper EXIF library here
    // For now, we'll return mock data
    return {
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      timestamp: new Date().toISOString()
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const metadata = await extractExifData(file);
      onPhotoSelect(file, metadata);
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }, [onPhotoSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false)
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative h-64 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer animate-fade-in",
        isDragging ? "border-civic-accent bg-civic-accent/5" : "border-gray-200 hover:border-gray-300"
      )}
    >
      <input {...getInputProps()} />
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
          {uploadProgress === 0 ? (
            <Upload className="w-6 h-6 text-gray-400" />
          ) : (
            <Camera className="w-6 h-6 text-civic-accent" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">
            Drop your photo here or click to upload
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports JPEG, JPG, PNG
          </p>
        </div>
      </div>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}
    </Card>
  );
};

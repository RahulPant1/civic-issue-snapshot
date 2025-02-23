
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import EXIF from 'exif-js';

interface PhotoUploadProps {
  onPhotoSelect: (file: File, metadata: any) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoSelect }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const extractExifData = (file: File): Promise<any> => {
    return new Promise((resolve) => {
      EXIF.getData(file as any, function(this: any) {
        const exifData = EXIF.getAllTags(this);
        
        let latitude = null;
        let longitude = null;

        if (exifData.GPSLatitude && exifData.GPSLongitude) {
          const latDegrees = exifData.GPSLatitude[0].numerator / exifData.GPSLatitude[0].denominator;
          const latMinutes = exifData.GPSLatitude[1].numerator / exifData.GPSLatitude[1].denominator;
          const latSeconds = exifData.GPSLatitude[2].numerator / exifData.GPSLatitude[2].denominator;
          const latDirection = exifData.GPSLatitudeRef;

          const longDegrees = exifData.GPSLongitude[0].numerator / exifData.GPSLongitude[0].denominator;
          const longMinutes = exifData.GPSLongitude[1].numerator / exifData.GPSLongitude[1].denominator;
          const longSeconds = exifData.GPSLongitude[2].numerator / exifData.GPSLongitude[2].denominator;
          const longDirection = exifData.GPSLongitudeRef;

          latitude = (latDegrees + latMinutes / 60 + latSeconds / 3600) * (latDirection === 'N' ? 1 : -1);
          longitude = (longDegrees + longMinutes / 60 + longSeconds / 3600) * (longDirection === 'E' ? 1 : -1);
        }

        resolve({
          location: {
            // Fallback to NYC coordinates if no GPS data is found
            latitude: latitude || 40.7128,
            longitude: longitude || -74.0060
          },
          timestamp: exifData.DateTime || new Date().toISOString()
        });
      });
    });
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
      // Even if EXIF extraction fails, we still want to upload the image with default coordinates
      onPhotoSelect(file, {
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        timestamp: new Date().toISOString()
      });
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

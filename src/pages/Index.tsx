
import React, { useState } from 'react';
import { PhotoUpload } from '@/components/PhotoUpload';
import { IssueAnalyzer } from '@/components/IssueAnalyzer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Share } from 'lucide-react';

const Index = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    file: File;
    preview: string;
    metadata: any;
  } | null>(null);
  const [issueSummary, setIssueSummary] = useState<string>('');

  const handlePhotoSelect = (file: File, metadata: any) => {
    setSelectedPhoto({
      file,
      preview: URL.createObjectURL(file),
      metadata
    });
  };

  const handleAnalysisComplete = (summary: string) => {
    setIssueSummary(summary);
  };

  const handleShare = async () => {
    if (!selectedPhoto || !issueSummary) return;

    const { latitude, longitude } = selectedPhoto.metadata.location;
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const tweetText = `🚨 Civic Issue Report: ${issueSummary}\n📍 Location: ${mapsUrl}`;

    // Open Twitter share dialog
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      '_blank'
    );

    toast({
      title: "Sharing to Twitter",
      description: "Opening Twitter share dialog...",
    });
  };

  return (
    <div className="min-h-screen bg-civic-background">
      <div className="container max-w-2xl mx-auto py-8 px-4 space-y-8">
        <div className="text-center space-y-4 animate-fade-up">
          <h1 className="text-4xl font-bold text-gray-900">Civic Issue Reporter</h1>
          <p className="text-gray-600">
            Upload a photo of a civic issue and share it with your community
          </p>
        </div>

        <div className="space-y-6">
          <PhotoUpload onPhotoSelect={handlePhotoSelect} />

          {selectedPhoto && (
            <div className="space-y-6 animate-fade-up">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.preview}
                  alt="Selected issue"
                  className="w-full h-full object-cover"
                />
              </div>

              <IssueAnalyzer
                imageUrl={selectedPhoto.preview}
                onAnalysisComplete={handleAnalysisComplete}
              />

              {issueSummary && (
                <Button
                  onClick={handleShare}
                  className="w-full bg-civic-accent hover:bg-civic-accent/90 text-white"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share on Twitter
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

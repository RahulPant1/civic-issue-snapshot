
import React, { useState, useEffect } from 'react';
import { pipeline } from '@huggingface/transformers';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface IssueAnalyzerProps {
  imageUrl: string;
  onAnalysisComplete: (summary: string) => void;
}

export const IssueAnalyzer: React.FC<IssueAnalyzerProps> = ({
  imageUrl,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const analyzeImage = async () => {
      try {
        const classifier = await pipeline(
          'image-classification',
          'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
          { device: 'webgpu' }
        );

        const result = await classifier(imageUrl);
        
        // For now, we'll use a mock analysis
        const mockAnalysis = "Broken sidewalk requiring immediate repair";
        setAnalysis(mockAnalysis);
        onAnalysisComplete(mockAnalysis);
      } catch (error) {
        console.error('Error analyzing image:', error);
        setAnalysis('Error analyzing image');
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeImage();
  }, [imageUrl, onAnalysisComplete]);

  return (
    <Card className="p-4 space-y-4 animate-fade-up">
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="bg-civic-accent/10 text-civic-accent">
          AI Analysis
        </Badge>
      </div>
      
      {isAnalyzing ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-civic-accent mt-0.5" />
          <p className="text-sm text-gray-700">{analysis}</p>
        </div>
      )}
    </Card>
  );
};

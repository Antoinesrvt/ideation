import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Dynamically import the JourneyCanvas component to avoid SSR issues with canvas
const JourneyCanvas = dynamic(
  () => import('@/features/journey/components/canvas/JourneyCanvas'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-[calc(100vh-56px)]">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading your journey canvas...</span>
      </div>
    )
  }
);

interface CanvasPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Journey Canvas | Ideation',
  description: 'Interactive journey canvas with enhanced overview for entrepreneurial planning',
};

export default function CanvasPage({ params }: CanvasPageProps) {
  return (
    <main className="w-full h-[calc(100vh-56px)] bg-gray-50">
      <Suspense fallback={
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Preparing your journey canvas...</span>
        </div>
      }>
        <JourneyCanvas 
          projectId={params.id}
          initialFocus={{ type: 'overview' }}
        />
      </Suspense>
    </main>
  );
} 
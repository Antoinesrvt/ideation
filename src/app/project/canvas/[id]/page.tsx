import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Dynamically import the New JourneyCanvas component to avoid SSR issues with canvas
const NewJourneyCanvas = dynamic(
  () => import('@/features/journey/components/NewJourneyCanvas').then(mod => ({ default: mod.NewJourneyCanvas })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-[calc(100vh-56px)]">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Chargement du parcours entrepreneurial...</span>
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
  title: 'Parcours Entrepreneurial | Ideation',
  description: 'Parcours interactif pour la validation et le développement de votre idée business',
};

export default function CanvasPage({ params }: CanvasPageProps) {
  return (
    <main className="w-full h-[calc(100vh-56px)] bg-gray-50">
      <Suspense fallback={
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Préparation de votre parcours entrepreneurial...</span>
        </div>
      }>
        <NewJourneyCanvas 
          projectId={params.id}
          initialFocus={{ type: 'overview' }}
        />
      </Suspense>
    </main>
  );
} 
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Dynamically import the AppCanvas component to avoid SSR issues with canvas
const AppCanvas = dynamic(
  () => import('@/features/journey/components/AppCanvas').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-[calc(100vh-56px)]">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Chargement de l'espace de travail...</span>
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
  title: 'Espace de Travail | Ideation',
  description: 'Espace interactif pour le développement et la validation de votre projet',
};

export default function CanvasPage({ params }: CanvasPageProps) {
  return (
    <main className="w-full h-[calc(100vh-56px)] bg-gray-50">
      <Suspense fallback={
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Préparation de votre espace de travail...</span>
        </div>
      }>
        <AppCanvas 
          projectId={params.id}
          initialApp={null} // Start with the dashboard view
        />
      </Suspense>
    </main>
  );
} 
import { Metadata } from 'next';
import { Suspense } from 'react';
import { JourneyDashboard } from '@/features/journey/components/JourneyDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Project Journey',
  description: 'Your startup journey dashboard',
};

export default function ProjectTestPage({ params }: ProjectPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 overflow-auto">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <JourneyDashboard projectId={params.id} />
      </Suspense>
    </main>
  );
} 
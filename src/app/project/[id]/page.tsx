import { Suspense } from 'react';
import { notFound } from 'next/navigation';
// import { getProject } from '@/lib/supabase/projects';
import { ProjectWorkspace } from '@/components/project/ProjectWorkspace';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = params;
  // const project = await getProject(id);

  // if (!project) {
  //   notFound();
  // }

  return (
    <div className="flex flex-col w-full h-full min-h-screen">
      <ProjectWorkspace projectId={id} />
    </div>
  );
}

export default function ProjectPageWithSuspense({ params }: ProjectPageProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Loading project...</h1>
        </div>
      </div>
    }>
      <ProjectPage params={params} />
    </Suspense>
  );
} 
import { Header } from '@/components/project/Header';

export default async function ProjectTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" style={{ overflow: 'auto', height: '100vh' }}>
      <div className="z-50 bg-white border-b flex-none">
        <Header 
          activeSection="overview"
          projectName="Project Journey"
          sidebarCollapsed={false}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 
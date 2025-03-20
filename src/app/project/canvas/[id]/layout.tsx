import { Header } from '@/components/project/Header';

export default async function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50" style={{ overflow: 'hidden', height: '100vh' }}>
      <div className="z-50 bg-white border-b border-gray-200 flex-none shadow-sm">
        <Header 
          activeSection="overview"
          projectName="Journey Canvas"
          sidebarCollapsed={true}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
} 
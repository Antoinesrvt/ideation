import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart4 } from 'lucide-react';

// Mock data for the radar chart
const mockDimensions = [
  { id: 'problem-solution', name: 'Problem-Solution Fit', score: 0.8 },
  { id: 'market', name: 'Market Opportunity', score: 0.7 },
  { id: 'business-model', name: 'Business Model', score: 0.5 },
  { id: 'execution', name: 'Execution Capability', score: 0.6 },
  { id: 'competition', name: 'Competitive Positioning', score: 0.4 },
  { id: 'unit-economics', name: 'Unit Economics', score: 0.3 },
];

const mockBenchmarks = {
  'Successful Ventures': [0.7, 0.6, 0.6, 0.5, 0.5, 0.6],
  'Your Industry': [0.5, 0.6, 0.4, 0.4, 0.5, 0.4]
};

interface VentureViabilityRadarProps {
  dimensions?: Array<{ id: string; name: string; score: number }>;
  benchmarks?: Record<string, number[]>;
}

export function VentureViabilityRadar({ 
  dimensions = mockDimensions, 
  benchmarks = mockBenchmarks 
}: VentureViabilityRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get the overall score (average of all dimensions)
  const overallScore = dimensions.reduce((sum, dim) => sum + dim.score, 0) / dimensions.length;
  
  // Function to draw the radar chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = 500;
    canvas.height = 500;
    
    // Define chart parameters
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw circular grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
      const gridRadius = radius * (i / 5);
      ctx.beginPath();
      ctx.arc(centerX, centerY, gridRadius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Add percentage labels
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.fillText(`${i * 20}%`, centerX, centerY - gridRadius - 5);
    }
    
    // Draw axis lines and labels
    const angles = dimensions.map((_, i) => (i * 2 * Math.PI) / dimensions.length);
    
    angles.forEach((angle, i) => {
      const dim = dimensions[i];
      
      // Draw axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.sin(angle),
        centerY - radius * Math.cos(angle)
      );
      ctx.stroke();
      
      // Draw axis label
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#374151';
      
      const labelX = centerX + (radius + 20) * Math.sin(angle);
      const labelY = centerY - (radius + 20) * Math.cos(angle);
      
      ctx.textAlign = angle < Math.PI ? 'left' : 'right';
      if (angle === 0) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
      } else if (angle === Math.PI) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
      } else {
        ctx.textBaseline = 'middle';
      }
      
      ctx.fillText(dim.name, labelX, labelY);
    });
    
    // Function to draw a polygon for a data series
    const drawPolygon = (data: number[], color: string, fillOpacity: number) => {
      ctx.beginPath();
      
      data.forEach((value, i) => {
        const angle = angles[i];
        const distance = value * radius;
        
        const x = centerX + distance * Math.sin(angle);
        const y = centerY - distance * Math.cos(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = `${color}${Math.round(fillOpacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    };
    
    // Draw benchmark polygons
    Object.entries(benchmarks).forEach(([name, data], i) => {
      const colors = ['#3b82f6', '#10b981'];
      drawPolygon(data, colors[i % colors.length], 0.1);
    });
    
    // Draw the main polygon
    const scores = dimensions.map(dim => dim.score);
    drawPolygon(scores, '#7209B7', 0.2);
    
    // Draw data points
    scores.forEach((score, i) => {
      const angle = angles[i];
      const distance = score * radius;
      
      const x = centerX + distance * Math.sin(angle);
      const y = centerY - distance * Math.cos(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#7209B7';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }, [dimensions, benchmarks]);
  
  // Get overall viability assessment
  const getOverallAssessment = (score: number) => {
    if (score >= 0.7) return 'Strong';
    if (score >= 0.5) return 'Viable';
    if (score >= 0.3) return 'Challenging';
    return 'Concerning';
  };
  
  // Get color for the assessment badge
  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case 'Strong': return 'bg-green-100 text-green-800';
      case 'Viable': return 'bg-blue-100 text-blue-800';
      case 'Challenging': return 'bg-amber-100 text-amber-800';
      case 'Concerning': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const assessment = getOverallAssessment(overallScore);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <BarChart4 className="h-5 w-5 mr-2 text-blue-500" />
            Venture Viability Radar
          </CardTitle>
          <Badge className={getAssessmentColor(assessment)}>
            {assessment} ({Math.round(overallScore * 100)}%)
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row">
          {/* Radar Chart */}
          <div className="flex-1 flex justify-center">
            <canvas ref={canvasRef} className="max-w-full h-auto" />
          </div>
          
          {/* Dimensions Breakdown */}
          <div className="md:w-64 mt-6 md:mt-0 md:ml-6">
            <h3 className="text-sm font-medium mb-3 text-gray-700">Dimensions Breakdown</h3>
            <div className="space-y-3">
              {dimensions.map(dim => (
                <div key={dim.id} className="bg-gray-50 p-2 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium">{dim.name}</div>
                    <div className="text-sm text-gray-600">{Math.round(dim.score * 100)}%</div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        dim.score >= 0.7 ? 'bg-green-500' :
                        dim.score >= 0.5 ? 'bg-blue-500' :
                        dim.score >= 0.3 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${dim.score * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2 text-gray-700">Legend</h3>
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded-full bg-[#7209B7] opacity-80 mr-2" />
                  <span>Your Venture</span>
                </div>
                {Object.keys(benchmarks).map((benchmark, i) => (
                  <div key={i} className="flex items-center text-xs">
                    <div 
                      className={`w-3 h-3 rounded-full mr-2 ${i === 0 ? 'bg-blue-500' : 'bg-green-500'} opacity-40`} 
                    />
                    <span>{benchmark}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
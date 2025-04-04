import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle, Maximize2, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Define matrix quadrant type
export type MatrixQuadrant = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';

// Define positioning item interface
export interface PositioningItem {
  id: string;
  [key: string]: any;
}

// Define initial position type
export interface PositionData {
  [id: string]: { x: number; y: number };
}

// Define axis configuration
export interface AxisConfig {
  label: string;
  min: number;
  max: number;
  lowLabel?: string;
  highLabel?: string;
}

// Define component props
interface PositioningMatrixProps<T extends PositioningItem> {
  items: T[];
  idKey?: keyof T;
  initialPositions?: PositionData;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  quadrantLabels?: Record<MatrixQuadrant, string>;
  onPositionChange?: (itemId: string, x: number, y: number) => void;
  onQuadrantChange?: (itemId: string, quadrant: MatrixQuadrant) => void;
  renderItem: (props: {
    item: T;
    isDragging: boolean;
    position: { x: number; y: number };
  }) => ReactNode;
  className?: string;
  itemsLabel?: string;
  enableZoom?: boolean;
  showLegend?: boolean;
}

export function PositioningMatrix<T extends PositioningItem>({
  items,
  idKey = 'id' as keyof T,
  initialPositions,
  xAxis,
  yAxis,
  quadrantLabels,
  onPositionChange,
  onQuadrantChange,
  renderItem,
  className,
  itemsLabel = 'Items',
  enableZoom = true,
  showLegend: initialShowLegend = false,
}: PositioningMatrixProps<T>) {
  // Get initial positions or default to center
  const getInitialPositions = useMemo(() => {
    const positions: PositionData = {};
    items.forEach((item) => {
      const id = String(item[idKey]);
      // Use provided initial positions or default to center
      if (initialPositions && initialPositions[id]) {
        positions[id] = initialPositions[id];
      } else {
        positions[id] = { x: 0.5, y: 0.5 };
      }
    });
    return positions;
  }, [items, idKey, initialPositions]);

  // State for positions, dragging, and UI controls
  const [positions, setPositions] = useState<PositionData>(getInitialPositions);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showLegend, setShowLegend] = useState<boolean>(initialShowLegend);

  // Update positions when items or initialPositions change
  useEffect(() => {
    setPositions((prevPositions) => {
      const newPositions = { ...prevPositions };
      
      // Add positions for new items
      items.forEach((item) => {
        const id = String(item[idKey]);
        if (!newPositions[id]) {
          if (initialPositions && initialPositions[id]) {
            newPositions[id] = initialPositions[id];
          } else {
            newPositions[id] = { x: 0.5, y: 0.5 };
          }
        }
      });
      
      // Remove positions for items that no longer exist
      Object.keys(newPositions).forEach((id) => {
        if (!items.some((item) => String(item[idKey]) === id)) {
          delete newPositions[id];
        }
      });
      
      return newPositions;
    });
  }, [items, idKey, initialPositions]);

  // Helper to get quadrant from position
  const getQuadrant = (x: number, y: number): MatrixQuadrant => {
    if (x >= 0.5 && y >= 0.5) return 'topRight';
    if (x < 0.5 && y >= 0.5) return 'topLeft';
    if (x >= 0.5 && y < 0.5) return 'bottomRight';
    return 'bottomLeft';
  };

  // Handle mouse down on an item
  const handleMouseDown = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingId(id);
  };

  // Handle mouse move to drag items
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;

    const matrix = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - matrix.left) / matrix.width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - matrix.top) / matrix.height));

    setPositions((prev) => ({
      ...prev,
      [draggingId]: { x, y }
    }));

    // Call position change handler
    if (onPositionChange) {
      onPositionChange(draggingId, x, y);
    }

    // Call quadrant change handler if quadrant has changed
    if (onQuadrantChange) {
      const newQuadrant = getQuadrant(x, y);
      const oldPosition = positions[draggingId];
      const oldQuadrant = oldPosition ? getQuadrant(oldPosition.x, oldPosition.y) : null;
      
      if (oldQuadrant !== newQuadrant) {
        onQuadrantChange(draggingId, newQuadrant);
      }
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.6));
  };

  // Handle reset zoom
  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Toggle legend visibility
  const toggleLegend = () => {
    setShowLegend((prev) => !prev);
  };

  // Default quadrant labels if not provided
  const defaultQuadrantLabels: Record<MatrixQuadrant, string> = {
    topRight: 'High/High',
    topLeft: 'Low/High',
    bottomRight: 'High/Low',
    bottomLeft: 'Low/Low'
  };

  // Use provided quadrant labels or defaults
  const finalQuadrantLabels = quadrantLabels || defaultQuadrantLabels;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">{itemsLabel} Positioning Matrix</h3>
        <div className="flex items-center space-x-1">
          {enableZoom && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.6}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handleResetZoom}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleLegend}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="end">
                Toggle legend
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="relative flex-1 border border-border rounded-md overflow-hidden">
        {/* Matrix Container */}
        <div
          className="relative w-full h-full bg-white rounded-md"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Vertical divider */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-200 transform -translate-x-1/2" />

          {/* Horizontal divider */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200 transform -translate-y-1/2" />

          {/* X-axis label */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
            <span>{xAxis.lowLabel || xAxis.min}</span>
            <span>{xAxis.highLabel || xAxis.max}</span>
          </div>

          {/* Y-axis label */}
          <div className="absolute top-0 bottom-0 left-1 flex flex-col justify-between items-start text-xs text-muted-foreground py-2">
            <span>{yAxis.highLabel || yAxis.max}</span>
            <span>{yAxis.lowLabel || yAxis.min}</span>
          </div>

          {/* X-axis title */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-medium">
            {xAxis.label}
          </div>

          {/* Y-axis title - rotated */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 -rotate-90 text-xs font-medium whitespace-nowrap">
            {yAxis.label}
          </div>

          {/* Quadrant labels */}
          <div className="absolute top-2 left-1/4 transform -translate-x-1/2 text-[10px] text-muted-foreground">
            {finalQuadrantLabels.topLeft}
          </div>
          <div className="absolute top-2 right-1/4 transform translate-x-1/2 text-[10px] text-muted-foreground">
            {finalQuadrantLabels.topRight}
          </div>
          <div className="absolute bottom-8 left-1/4 transform -translate-x-1/2 text-[10px] text-muted-foreground">
            {finalQuadrantLabels.bottomLeft}
          </div>
          <div className="absolute bottom-8 right-1/4 transform translate-x-1/2 text-[10px] text-muted-foreground">
            {finalQuadrantLabels.bottomRight}
          </div>

          {/* Items */}
          <div
            className="absolute inset-0 p-8"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            {items.map((item) => {
              const id = String(item[idKey]);
              const position = positions[id] || { x: 0.5, y: 0.5 };
              
              return (
                <div
                  key={id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                  style={{
                    left: `${position.x * 100}%`,
                    top: `${100 - position.y * 100}%`,
                    touchAction: 'none',
                  }}
                  onMouseDown={handleMouseDown(id)}
                >
                  {renderItem({
                    item,
                    isDragging: draggingId === id,
                    position
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-2 p-3 bg-background border border-border rounded-md text-xs">
          <div className="font-medium mb-1">Matrix Legend</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="font-medium text-muted-foreground">{xAxis.label}:</div>
              <div className="flex justify-between">
                <span>{xAxis.lowLabel || 'Low'}</span>
                <span>{xAxis.highLabel || 'High'}</span>
              </div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">{yAxis.label}:</div>
              <div className="flex justify-between">
                <span>{yAxis.lowLabel || 'Low'}</span>
                <span>{yAxis.highLabel || 'High'}</span>
              </div>
            </div>
          </div>
          <div className="mt-1">
            <div className="font-medium text-muted-foreground">Quadrants:</div>
            <div className="grid grid-cols-2 gap-1">
              <div>{finalQuadrantLabels.topLeft}: {xAxis.lowLabel || 'Low'} {xAxis.label}, {yAxis.highLabel || 'High'} {yAxis.label}</div>
              <div>{finalQuadrantLabels.topRight}: {xAxis.highLabel || 'High'} {xAxis.label}, {yAxis.highLabel || 'High'} {yAxis.label}</div>
              <div>{finalQuadrantLabels.bottomLeft}: {xAxis.lowLabel || 'Low'} {xAxis.label}, {yAxis.lowLabel || 'Low'} {yAxis.label}</div>
              <div>{finalQuadrantLabels.bottomRight}: {xAxis.highLabel || 'High'} {xAxis.label}, {yAxis.lowLabel || 'Low'} {yAxis.label}</div>
            </div>
          </div>
          <div className="mt-1">
            <div className="font-medium text-muted-foreground">Instructions:</div>
            <div>Drag items to position them on the matrix based on their {xAxis.label} and {yAxis.label}.</div>
          </div>
        </div>
      )}
    </div>
  );
} 
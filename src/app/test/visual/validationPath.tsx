import { Connection, CircleData, Segment, ValidationStatus } from "./types";
import { getSegmentAngle, statusColors } from "./page";
import { findSegmentById } from "./page";
import React from "react";

type ValidationPathProps = {
  connection: Connection;
  circlesData: CircleData[];
  centerX: number;
  centerY: number;
  isHighlighted: boolean;
};

// ValidationPath component with improved routing and animation
export const ValidationPath = ({
  connection,
  circlesData,
  centerX,
  centerY,
  isHighlighted,
}: ValidationPathProps) => {
  // Find source and target segments
  const sourceData = findSegmentById(connection.from, circlesData);
  const targetData = findSegmentById(connection.to, circlesData);

  if (!sourceData || !targetData) return null;

  // Get the circles for both segments
  const { circle: sourceCircle } = sourceData;
  const { circle: targetCircle } = targetData;

  // Calculate better path control points based on circle positions
  // This creates more natural curves that flow between circles
  const getSmartPath = () => {
    const sourceAngle = getSegmentAngle(sourceData.segment, sourceCircle);
    const targetAngle = getSegmentAngle(targetData.segment, targetCircle);

    // Source and target points
    const sourceX = centerX + Math.cos(sourceAngle) * sourceCircle.radius;
    const sourceY = centerY + Math.sin(sourceAngle) * sourceCircle.radius;
    const targetX = centerX + Math.cos(targetAngle) * targetCircle.radius;
    const targetY = centerY + Math.sin(targetAngle) * targetCircle.radius;

    // Determine if we're going inward or outward
    const isInward = sourceCircle.radius > targetCircle.radius;

    // Calculate distance between points
    const distance = Math.sqrt(
      Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)
    );
    
    // Calculate control points for a natural curve
    // For inner to outer circles, we want the curve to flow outward
    // For outer to inner, we want it to flow inward
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    // Find the perpendicular direction to create a curve
    const perpX = -(targetY - sourceY);
    const perpY = targetX - sourceX;

    // Normalize the perpendicular vector
    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
    const normPerpX = perpX / perpLength;
    const normPerpY = perpY / perpLength;

    // Adjust curve strength based on direction and distance
    const curveStrength = isInward ? distance * 0.2 : distance * 0.3;

    // Control points that create a nice curve
    const cp1X = sourceX + (midX - sourceX) * 0.4 + normPerpX * curveStrength;
    const cp1Y = sourceY + (midY - sourceY) * 0.4 + normPerpY * curveStrength;
    const cp2X = midX + normPerpX * curveStrength;
    const cp2Y = midY + normPerpY * curveStrength;
    const cp3X = targetX - (targetX - midX) * 0.4 + normPerpX * curveStrength;
    const cp3Y = targetY - (targetY - midY) * 0.4 + normPerpY * curveStrength;

    // Calculate a point along the path for the flow indicator
    const pathT = 0.5; // position along the path (0-1)
    const flowX = bezierPoint(sourceX, cp1X, cp2X, targetX, pathT);
    const flowY = bezierPoint(sourceY, cp1Y, cp2Y, targetY, pathT);

    return {
      path: `M${sourceX},${sourceY} C${cp1X},${cp1Y} ${cp3X},${cp3Y} ${targetX},${targetY}`,
      flowPoint: { x: flowX, y: flowY },
    };
  };

  // Helper function to calculate a point on a cubic bezier curve
  const bezierPoint = (p0: number, p1: number, p2: number, p3: number, t: number) => {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
  };

  // Get path and flow point
  const { path, flowPoint } = getSmartPath();

  // Get status-specific styles
  const getPathStyle = (status: ValidationStatus, isHighlighted: boolean) => {
    // Different dash patterns based on status
    let dashPattern = "none";
    let strokeOpacity = isHighlighted ? 0.9 : 0.5;
    let strokeWidth = isHighlighted ? 2.5 : 1.5;

    switch (status) {
      case "validated":
        dashPattern = "none";
        strokeOpacity = isHighlighted ? 1 : 0.7;
        break;
      case "invalidated":
        dashPattern = "6,3";
        break;
      case "in-progress":
        dashPattern = "3,3";
        break;
      case "untested":
        dashPattern = "2,4";
        strokeOpacity = isHighlighted ? 0.8 : 0.4;
        strokeWidth = isHighlighted ? 2 : 1;
        break;
    }

    return {
      strokeDasharray: dashPattern,
      strokeOpacity: strokeOpacity,
      strokeWidth: strokeWidth,
    };
  };

  const pathStyle = getPathStyle(connection.validationStatus, isHighlighted);
  
  // Determine if we should show flow animation
  const showFlowAnimation = connection.validationStatus === "in-progress" || isHighlighted;

  return (
    <g className={`validation-path-group ${isHighlighted ? 'highlighted' : ''}`}>
      {/* Main path */}
      <path
        d={path}
        stroke={statusColors[connection.validationStatus]}
        strokeWidth={pathStyle.strokeWidth}
        fill="none"
        opacity={pathStyle.strokeOpacity}
        strokeDasharray={pathStyle.strokeDasharray}
        className={`validation-path ${isHighlighted ? 'highlighted' : ''}`}
        markerEnd={`url(#arrowhead-${connection.validationStatus})`}
      />
      
      {/* Flow indicator animation for highlighted or in-progress connections */}
      {showFlowAnimation && (
        <circle
          cx={flowPoint.x}
          cy={flowPoint.y}
          r={4}
          fill={statusColors[connection.validationStatus]}
          className="flow-indicator"
        >
          <animate
            attributeName="opacity"
            values="0;0.9;0"
            dur="1.8s"
            repeatCount="indefinite"
          />
          <animateMotion
            dur="4s"
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      )}
    </g>
  );
};

// Add these marker definitions to your SVG
export const PathMarkers = () => (
  <defs>
    {Object.entries(statusColors).map(([status, color]) => (
      <marker
        key={status}
        id={`arrowhead-${status}`}
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon 
          points="0 0, 10 3.5, 0 7" 
          fill={color} 
          stroke={color} 
          strokeWidth="0.5"
        />
      </marker>
    ))}

    {/* Shadow filters for highlighting */}
    <filter id="hover-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#3b82f6" floodOpacity="0.4" />
    </filter>

    <filter id="selected-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.5" />
    </filter>

    {/* Animation keyframes */}
    <style type="text/css">
      {`
        @keyframes drawPath {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        .flow-indicator {
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
        }
        
        .validation-path {
          transition: all 0.3s ease;
        }
        
        .validation-path.highlighted {
          filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.5));
        }
      `}
    </style>
  </defs>
);

export default ValidationPath;
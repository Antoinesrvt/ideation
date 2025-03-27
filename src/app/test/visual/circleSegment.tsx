import { Segment, ValidationStatus } from "./types";
import { statusColors } from "./page";
import React from "react";

type CircleSegmentProps = {
  segment: Segment;
  arcData: any;
  arcGenerator: any;
  centerX: number;
  centerY: number;
  status: ValidationStatus;
  isSelected: boolean;
  isHovered: boolean;
  isConnected: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
};

export const CircleSegment = ({
  segment,
  arcData,
  arcGenerator,
  centerX,
  centerY,
  status,
  isSelected,
  isHovered,
  isConnected,
  onHover,
  onLeave,
  onClick,
}: CircleSegmentProps) => {
  // Calculate position for the label and status indicator
  const [rawX, rawY] = arcGenerator.centroid(arcData);

  // Normalize the angle for the segment (0 to 2π)
  const angle = Math.atan2(rawY, rawX);

  // Calculate better positions based on angle
  const labelRadius = isSelected ? 1.08 : 1.15; // Push labels further out when not selected
  const labelX = centerX + rawX * labelRadius;
  const labelY = centerY + rawY * labelRadius;

  // Position for status indicator
  const statusRadius = 0.85; // Place status indicator at 85% of the arc radius
  const statusX = centerX + rawX * statusRadius;
  const statusY = centerY + rawY * statusRadius;

  // Determine text anchor based on position in the circle
  // This ensures text aligns properly based on which side of the circle it's on
  const textAnchor =
    angle > -Math.PI / 2 && angle < Math.PI / 2 ? "start" : "end";

  // Ensure text is always right-side up
  const labelRotation =
    angle > -Math.PI / 2 && angle < Math.PI / 2
      ? (angle * 180) / Math.PI
      : (angle * 180) / Math.PI + 180;

  // Dynamic fill based on state
  const getFill = () => {
    if (isSelected) return `${statusColors[status]}CC`; // 80% opacity
    if (isHovered) return `${statusColors[status]}66`; // 40% opacity
    if (isConnected) return `${statusColors[status]}33`; // 20% opacity
    
    // Default state with subtle gradient
    if (status === "validated") return "rgba(5, 150, 105, 0.1)";
    if (status === "invalidated") return "rgba(220, 38, 38, 0.1)";
    if (status === "in-progress") return "rgba(245, 158, 11, 0.1)";
    return "rgba(255, 255, 255, 0.5)"; // Untested
  };

  // Get stroke width and opacity based on state
  const getStrokeWidth = () => {
    if (isSelected) return 2.5;
    if (isHovered) return 2;
    if (isConnected) return 1.5;
    return 1;
  };

  const getOpacity = () => {
    if (isSelected) return 1;
    if (isHovered) return 0.95;
    if (isConnected) return 0.9;
    return 0.8;
  };

  // Get classes for the segment
  const getSegmentClasses = () => {
    return `
      circle-segment 
      status-${status} 
      ${isSelected ? "selected" : ""} 
      ${isHovered ? "hovered" : ""} 
      ${isConnected ? "connected" : ""}
    `;
  };

  return (
    <g
      className={getSegmentClasses()}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Segment shadow for depth (only for selected/hovered) */}
      {(isSelected || isHovered) && (
        <path
          d={arcGenerator(arcData)}
          transform={`translate(${centerX}, ${centerY})`}
          fill="none"
          stroke="#000"
          strokeWidth={0.5}
          opacity={0.1}
          filter="url(#segment-shadow)"
        />
      )}

      {/* Main segment arc with enhanced styling */}
      <path
        d={arcGenerator(arcData)}
        transform={`translate(${centerX}, ${centerY})`}
        fill={getFill()}
        stroke={statusColors[status]}
        strokeWidth={getStrokeWidth()}
        opacity={getOpacity()}
        className={`segment-path ${isSelected ? "selected" : ""}`}
      />

      {/* Enhanced status indicator */}
      <StatusIndicator
        status={status}
        centerX={statusX}
        centerY={statusY}
        isSelected={isSelected}
        isHovered={isHovered}
      />

      {/* Improved label with better positioning and effects */}
      <g transform={`translate(${labelX}, ${labelY})`}>
        <text
          dy=".35em"
          textAnchor={textAnchor}
          className="segment-label"
          fontSize={isSelected ? 13 : 11}
          fontWeight={isSelected || isHovered ? "600" : "500"}
          transform={`rotate(${labelRotation})`}
          fill={isSelected ? "#1e293b" : "#475569"}
          style={{
            opacity: isSelected || isHovered ? 1 : 0.9,
            filter: isSelected
              ? "drop-shadow(0 1px 1px rgba(0,0,0,0.15))"
              : "none",
          }}
        >
          {segment.name}
        </text>
      </g>

      {/* Selection indicator arc (only shown when selected) */}
      {isSelected && (
        <path
          d={arcGenerator(arcData)}
          transform={`translate(${centerX}, ${centerY})`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1}
          strokeDasharray="3,3"
          opacity={0.6}
          className="selection-indicator"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="24"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
      )}
    </g>
  );
};

type StatusIndicatorProps = {
  status: ValidationStatus;
  centerX: number;
  centerY: number;
  isSelected: boolean;
  isHovered: boolean;
};

// Enhanced StatusIndicator component with improved visuals and animations
const StatusIndicator = ({
  status,
  centerX,
  centerY,
  isSelected,
  isHovered,
}: StatusIndicatorProps) => {
  // Base size adjusts based on state
  const baseSize = isSelected ? 11 : isHovered ? 10 : 9;
  const isActive = isSelected || isHovered;

  switch (status) {
    case "validated":
      return (
        <g
          transform={`translate(${centerX}, ${centerY})`}
          className="status-indicator validated"
        >
          {/* Outer glow for selected/hovered */}
          {isActive && (
            <circle
              r={baseSize + 3}
              fill="none"
              stroke={statusColors.validated}
              strokeWidth={1}
              opacity={0.3}
            >
              {isSelected && (
                <animate
                  attributeName="r"
                  values={`${baseSize + 2};${baseSize + 4};${baseSize + 2}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          )}
          
          {/* Main circle */}
          <circle 
            r={baseSize} 
            fill={statusColors.validated}
            className="status-circle"
          />
          
          {/* Checkmark */}
          <path
            d={`M-${baseSize / 2},0 L-${baseSize / 8},${baseSize / 3} L${
              baseSize / 2
            },-${baseSize / 2}`}
            stroke="white"
            strokeWidth={isActive ? 2.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="status-icon"
          />
        </g>
      );
      
    case "invalidated":
      return (
        <g
          transform={`translate(${centerX}, ${centerY})`}
          className="status-indicator invalidated"
        >
          {/* Outer glow for selected/hovered */}
          {isActive && (
            <circle
              r={baseSize + 3}
              fill="none"
              stroke={statusColors.invalidated}
              strokeWidth={1}
              opacity={0.3}
            />
          )}
          
          {/* Main circle */}
          <circle 
            r={baseSize} 
            fill={statusColors.invalidated}
            className="status-circle"
          />
          
          {/* X mark */}
          <path
            d={`M-${baseSize / 2},-${baseSize / 2} L${baseSize / 2},${
              baseSize / 2
            } M-${baseSize / 2},${baseSize / 2} L${baseSize / 2},-${
              baseSize / 2
            }`}
            stroke="white"
            strokeWidth={isActive ? 2.5 : 2}
            strokeLinecap="round"
            fill="none"
            className="status-icon"
          />
        </g>
      );
      
    case "in-progress":
      return (
        <g
          transform={`translate(${centerX}, ${centerY})`}
          className="status-indicator in-progress"
        >
          {/* Animated pulse ring */}
          <circle
            className="pulse-ring"
            r={baseSize}
            fill="none"
            stroke={statusColors["in-progress"]}
            strokeWidth={1.5}
            opacity={0.5}
          >
            <animate
              attributeName="r"
              values={`${baseSize};${baseSize + 3};${baseSize}`}
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.2;0.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          
          {/* Main circle */}
          <circle 
            r={baseSize} 
            fill={statusColors["in-progress"]}
            className="status-circle"
          />
          
          {/* Inner circle */}
          <circle
            r={baseSize / 2}
            fill="white"
            opacity={0.9}
            className="status-inner"
          />
        </g>
      );
      
    default: // untested
      return (
        <g
          transform={`translate(${centerX}, ${centerY})`}
          className="status-indicator untested"
        >
          {/* Dashed outline */}
          <circle
            r={baseSize}
            fill="none"
            stroke={statusColors.untested}
            strokeWidth={isActive ? 2 : 1.5}
            strokeDasharray={isActive ? "3,2" : "2,2"}
            className="status-circle"
          />
          
          {/* Center dot */}
          <circle 
            r={baseSize / 3} 
            fill={statusColors.untested} 
            opacity={isActive ? 0.7 : 0.5}
            className="status-inner"
          />
        </g>
      );
  }
};

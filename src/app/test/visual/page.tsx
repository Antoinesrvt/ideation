"use client";
import React, { useState } from "react";
import { arc, pie } from "d3-shape";
import "./style.css";
import sampleDashboardData from "./mockData";
import { ValidationStatus, Connection, Segment, CircleData } from "./types";
import ValidationPath, { PathMarkers } from "./validationPath";
import { CircleSegment } from "./circleSegment";

// Convert the sampleDashboardData to the format expected by our component
const convertToComponentData = (): { circlesData: CircleData[], connections: Connection[] } => {
  // Map circles data
  const circlesData: CircleData[] = sampleDashboardData.circles.map(circle => ({
    id: circle.id,
    name: circle.name,
    radius: circle.radius,
    segments: circle.segments.map(segment => ({
      id: segment.id,
      name: segment.name,
      validationStatus: segment.validationStatus as ValidationStatus
    }))
  }));

  // Map connections
  const connections: Connection[] = sampleDashboardData.connections.map(conn => ({
    from: conn.from,
    to: conn.to,
    validationStatus: conn.validationStatus as ValidationStatus
  }));

  return { circlesData, connections };
};

// Get the converted data
const { circlesData: mockCirclesData, connections: mockConnections } = convertToComponentData();

// Status colors
export const statusColors = {
  validated: "#059669", // Green
  invalidated: "#dc2626", // Red
  "in-progress": "#F59E0B", // Amber
  untested: "#94A3B8", // Slate
};

type ConcentricCirclesDashboardProps = {
  circlesData?: CircleData[];
  connections?: Connection[];
  width?: number;
  height?: number;
};

export default function ConcentricCirclesDashboard({
  circlesData = mockCirclesData,
  connections = mockConnections,
  width = 800,
  height = 800,
}: ConcentricCirclesDashboardProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Center point of the visualization
  const centerX = width / 2;
  const centerY = height / 2;

  // Find connected segments to the currently selected segment
  const findConnectedSegments = (segmentId: string) => {
    if (!segmentId) return [];

    return connections
      .filter((conn) => conn.from === segmentId || conn.to === segmentId)
      .map((conn) => (conn.from === segmentId ? conn.to : conn.from));
  };

  const connectedSegments = selectedSegment
    ? findConnectedSegments(selectedSegment)
    : [];

  // Calculate overall validation progress
  const calculateProgress = () => {
    const totalSegments = circlesData.reduce(
      (sum, circle) => sum + circle.segments.length, 
      0
    );
    
    const validatedSegments = circlesData.reduce(
      (sum, circle) => sum + circle.segments.filter(
        segment => segment.validationStatus === "validated"
      ).length,
      0
    );
    
    return { 
      percent: Math.round((validatedSegments / totalSegments) * 100),
      validated: validatedSegments,
      total: totalSegments
    };
  };

  const progress = calculateProgress();

  return (
    <div className="concentric-circles-dashboard">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* SVG definitions for markers, filters, and animations */}
        <defs>
          {/* Arrow markers for different validation statuses */}
          {Object.entries(statusColors).map(([status, color]) => (
            <marker
              key={`arrowhead-${status}`}
              id={`arrowhead-${status}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={color} />
            </marker>
          ))}
          
          {/* Shadow filters */}
          <filter id="segment-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2" />
          </filter>
          
          <filter id="hover-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.3" />
          </filter>
          
          <filter id="selected-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.4" />
          </filter>
          
          {/* Additional markers from ValidationPath component */}
          <PathMarkers />
        </defs>
        
        {/* Background circles for visual structure */}
        {circlesData.map((circle) => (
          <circle
            key={`bg-${circle.id}`}
            cx={centerX}
            cy={centerY}
            r={circle.radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={1}
            opacity={0.5}
          />
        ))}
        
        {/* Connection paths */}
        {connections.map((connection) => (
          <ValidationPath
            key={`${connection.from}-${connection.to}`}
            connection={connection}
            circlesData={circlesData}
            centerX={centerX}
            centerY={centerY}
            isHighlighted={
              selectedSegment !== null &&
              (connection.from === selectedSegment ||
                connection.to === selectedSegment)
            }
          />
        ))}
        
        {/* Circle layers with segments */}
        {circlesData.map((circle) => (
          <CircleLayer
            key={circle.id}
            circle={circle}
            centerX={centerX}
            centerY={centerY}
            selectedSegment={selectedSegment}
            hoveredSegment={hoveredSegment}
            connectedSegments={connectedSegments}
            onSegmentHover={setHoveredSegment}
            onSegmentSelect={setSelectedSegment}
          />
        ))}
      </svg>

      {/* Progress indicator */}
      <div className="dashboard-progress">
        <div className="progress-label">Validation Progress</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress.percent}%` }}
          ></div>
        </div>
        <div className="progress-stats">
          {progress.validated} of {progress.total} elements validated ({progress.percent}%)
        </div>
      </div>

      {/* Detail panel */}
      {selectedSegment && (
        <DetailPanel
          segment={selectedSegment}
          circlesData={circlesData}
          connections={connections}
          onClose={() => setSelectedSegment(null)}
        />
      )}
    </div>
  );
};

type CircleLayerProps = {
  circle: CircleData;
  centerX: number;
  centerY: number;
  selectedSegment: string | null;
  hoveredSegment: string | null;
  connectedSegments: string[];
  onSegmentHover: (segmentId: string | null) => void;
  onSegmentSelect: (segmentId: string) => void;
};

// CircleLayer component renders a single concentric circle with its segments
const CircleLayer = ({
  circle,
  centerX,
  centerY,
  selectedSegment,
  hoveredSegment,
  connectedSegments,
  onSegmentHover,
  onSegmentSelect,
}: CircleLayerProps) => {
  // Calculate arc for each segment using d3
  const pieGenerator = pie<Segment>()
    .value(() => 1) // Equal segments
    .sort(null); // Don't sort, preserve order

  // Create arcs for segments
  const segments = pieGenerator(circle.segments);

  const arcGenerator = arc<any>()
    .innerRadius(circle.radius - 25)
    .outerRadius(circle.radius);

  return (
    <g className="circle-layer">
      {/* Circle label */}
      <text
        x={centerX}
        y={centerY - circle.radius + 10}
        textAnchor="middle"
        className="circle-label"
      >
        {circle.name}
      </text>

      {/* Segments */}
      {segments.map((segment, i) => {
        const segmentData = circle.segments[i];
        const isSelected = selectedSegment === segmentData.id;
        const isHovered = hoveredSegment === segmentData.id;
        const isConnected = connectedSegments.includes(segmentData.id);

        return (
          <CircleSegment
            key={segmentData.id}
            segment={segmentData}
            arcData={segment}
            arcGenerator={arcGenerator}
            centerX={centerX}
            centerY={centerY}
            status={segmentData.validationStatus}
            isSelected={isSelected}
            isHovered={isHovered}
            isConnected={isConnected}
            onHover={() => onSegmentHover(segmentData.id)}
            onLeave={() => onSegmentHover(null)}
            onClick={() => onSegmentSelect(segmentData.id)}
          />
        );
      })}
    </g>
  );
};

type StatusIndicatorProps = {
  status: ValidationStatus;
  centerX: number;
  centerY: number;
};

// StatusIndicator component shows different icons based on validation status
const StatusIndicator = ({ status, centerX, centerY }: StatusIndicatorProps) => {
  switch (status) {
    case "validated":
      return (
        <g transform={`translate(${centerX}, ${centerY})`}>
          <circle r={10} fill={statusColors.validated} />
          <path
            d="M-4,0 L-1,3 L4,-3"
            stroke="white"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case "invalidated":
      return (
        <g transform={`translate(${centerX}, ${centerY})`}>
          <circle r={10} fill={statusColors.invalidated} />
          <path 
            d="M-3.5,-3.5 L3.5,3.5 M-3.5,3.5 L3.5,-3.5" 
            stroke="white" 
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>
      );
    case "in-progress":
      return (
        <g transform={`translate(${centerX}, ${centerY})`}>
          <circle r={10} fill={statusColors["in-progress"]} />
          <circle r={6} fill={statusColors["in-progress"]} strokeWidth={2} stroke="white" />
          <circle className="pulse-circle" r={10} fill="none" stroke={statusColors["in-progress"]} strokeWidth={1} opacity={0.6}>
            <animate attributeName="r" values="10;14;10" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    default:
      return (
        <g transform={`translate(${centerX}, ${centerY})`}>
          <circle
            r={9}
            fill="white"
            stroke={statusColors.untested}
            strokeWidth={1.5}
            strokeDasharray="3,2"
          />
          <circle r={3} fill={statusColors.untested} />
        </g>
      );
  }
};

type SegmentWithCircle = {
  segment: Segment;
  circle: CircleData;
};

// ValidationPath component renders connections between segments
type ValidationPathProps = {
  connection: Connection;
  circlesData: CircleData[];
  centerX: number;
  centerY: number;
  isHighlighted: boolean;
};

// Helper function to get approximate angle for a segment (simplified)
export const getSegmentAngle = (segment: Segment, circle: CircleData) => {
  const index = circle.segments.findIndex((s) => s.id === segment.id);
  const totalSegments = circle.segments.length;
  return (index / totalSegments) * Math.PI * 2;
};

type DetailPanelProps = {
  segment: string;
  circlesData: CircleData[];
  connections: Connection[];
  onClose: () => void;
};

// Detail panel shows information about selected segment
const DetailPanel = ({ segment, circlesData, connections, onClose }: DetailPanelProps) => {
  // Find the segment data
  const segmentData = findSegmentById(segment, circlesData);
  if (!segmentData) return null;

  const { segment: segmentInfo, circle } = segmentData;

  // Find connected segments
  const connectedSegments = connections
    .filter((conn) => conn.from === segment || conn.to === segment)
    .map((conn) => {
      const targetId = conn.from === segment ? conn.to : conn.from;
      const targetData = findSegmentById(targetId, circlesData);
      return {
        ...targetData,
        connectionStatus: conn.validationStatus,
        direction: conn.from === segment ? "outgoing" : "incoming",
      };
    })
    .filter((item): item is (SegmentWithCircle & { connectionStatus: ValidationStatus; direction: string }) => 
      item !== null && item.segment !== undefined && item.circle !== undefined
    );

  // Group connections by status for better organization
  const groupedConnections = {
    validated: connectedSegments.filter(c => c.connectionStatus === "validated"),
    "in-progress": connectedSegments.filter(c => c.connectionStatus === "in-progress"),
    invalidated: connectedSegments.filter(c => c.connectionStatus === "invalidated"),
    untested: connectedSegments.filter(c => c.connectionStatus === "untested"),
  };

  // Generate a summary of the hypothesis and evidence
  // This would come from real data in a complete implementation
  const getHypothesisSummary = () => {
    switch(segmentInfo.validationStatus) {
      case "validated":
        return "This hypothesis has been validated with strong evidence from customer interviews and market research.";
      case "invalidated":
        return "This hypothesis has been invalidated based on customer feedback and usage data.";
      case "in-progress":
        return "Currently gathering evidence to validate this hypothesis through customer interviews.";
      default:
        return "No validation activities have been started for this hypothesis yet.";
    }
  };

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <h3>{segmentInfo.name}</h3>
        <div className={`status-badge ${segmentInfo.validationStatus}`}>
          {segmentInfo.validationStatus}
        </div>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h4>Business Model Layer</h4>
          <p className="detail-meta">
            <span className="detail-meta-label">Layer:</span> 
            <span className="detail-meta-value">{circle.name}</span>
          </p>
          <p className="detail-meta">
            <span className="detail-meta-label">Status:</span>
            <span className="detail-meta-value status-text">
              <span className={`status-dot ${segmentInfo.validationStatus}`}></span>
              {segmentInfo.validationStatus}
            </span>
          </p>
        </div>

        <div className="detail-section">
          <h4>Hypothesis</h4>
          <p className="hypothesis-summary">{getHypothesisSummary()}</p>
          <div className="progress-indicator">
            <div className="progress-bar">
              <div 
                className={`progress-fill ${segmentInfo.validationStatus}`} 
                style={{ 
                  width: segmentInfo.validationStatus === "validated" ? "100%" :
                         segmentInfo.validationStatus === "invalidated" ? "100%" :
                         segmentInfo.validationStatus === "in-progress" ? "60%" : "0%" 
                }}
              ></div>
            </div>
            <span className="progress-text">
              {segmentInfo.validationStatus === "validated" ? "100%" :
               segmentInfo.validationStatus === "invalidated" ? "100%" :
               segmentInfo.validationStatus === "in-progress" ? "60%" : "0%"}
            </span>
          </div>
        </div>

        {connectedSegments.length > 0 && (
          <div className="detail-section">
            <h4>Connected Elements</h4>
            
            {Object.entries(groupedConnections).map(([status, connections]) => (
              connections.length > 0 && (
                <div key={status} className="connection-group">
                  <div className={`connection-group-header ${status}`}>
                    <span className={`status-dot ${status}`}></span>
                    <span className="connection-group-title">
                      {status === "validated" ? "Validated Connections" :
                       status === "invalidated" ? "Invalidated Connections" :
                       status === "in-progress" ? "In Progress Connections" :
                       "Untested Connections"}
                    </span>
                    <span className="connection-count">{connections.length}</span>
                  </div>
                  
                  <ul className="connected-list">
                    {connections.map(({ segment, circle, direction }) => (
                      <li
                        key={segment.id}
                        className={`connected-item ${direction}`}
                      >
                        <span className={`direction-indicator ${direction}`}>
                          {direction === "outgoing" ? "→" : "←"}
                        </span>
                        <div className="connected-details">
                          <span className="connected-name">{segment.name}</span>
                          <span className="connected-layer">({circle.name})</span>
                        </div>
                        <span className={`segment-status-indicator ${segment.validationStatus}`}>
                          <span className={`status-dot ${segment.validationStatus}`}></span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>
        )}

        <div className="detail-section action-section">
          <button className="action-button">Edit Hypothesis</button>
          <button className="action-button secondary">View Evidence</button>
        </div>
      </div>
    </div>
  );
};

// Helper function to find a segment by ID
export const findSegmentById = (id: string, circlesData: CircleData[]): SegmentWithCircle | null => {
  for (const circle of circlesData) {
    const segment = circle.segments.find((s) => s.id === id);
    if (segment) {
      return { segment, circle };
    }
  }
  return null;
};


import React, { useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Puzzle, Info, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { ProductProblem, ProductSolution } from '@/store/types';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ProblemSolutionMatrixProps {
  problems: ProductProblem[];
  solutions: ProductSolution[];
}

export function ProblemSolutionMatrix({ problems, solutions }: ProblemSolutionMatrixProps) {
  // Add mounted ref to prevent updates after unmounting
  const isMounted = useRef(true);
  
  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Filter to only validated/critical problems and solutions - memoize based on problems
  const filteredProblems = useMemo(() => 
    problems.filter(p => p.status === 'validated' || p.status === 'critical')
  , [problems]);
  
  // Memoize solutions with proper dependency
  const filteredSolutions = useMemo(() => solutions, [solutions]);
  
  // Create matrix data structure for more efficient lookup - ensure all dependencies are listed
  const matrix = useMemo(() => {
    const map = new Map<string, ProductSolution[]>();
    
    // Initialize map with empty arrays for each problem
    filteredProblems.forEach(problem => {
      map.set(problem.id, []);
    });
    
    // Add solutions to their respective problems
    filteredSolutions.forEach(solution => {
      if (solution.problem_id && map.has(solution.problem_id)) {
        const solutionsArray = map.get(solution.problem_id) || [];
        map.set(solution.problem_id, [...solutionsArray, solution]);
      }
    });
    
    return map;
  }, [filteredProblems, filteredSolutions]);
  
  // Get effectiveness rating display
  const getEffectivenessDisplay = (rating: number | null | undefined) => {
    const value = rating || 0;
    if (value > 75) return { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, text: 'High' };
    if (value > 50) return { icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />, text: 'Medium' };
    if (value > 25) return { icon: <AlertCircle className="h-4 w-4 text-amber-500" />, text: 'Low' };
    return { icon: <XCircle className="h-4 w-4 text-gray-500" />, text: 'Unknown' };
  };
  
  // Get feasibility rating display
  const getFeasibilityDisplay = (rating: number | null | undefined) => {
    const value = rating || 0;
    if (value > 75) return { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, text: 'Easy' };
    if (value > 50) return { icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />, text: 'Moderate' };
    if (value > 25) return { icon: <AlertCircle className="h-4 w-4 text-amber-500" />, text: 'Difficult' };
    return { icon: <XCircle className="h-4 w-4 text-gray-500" />, text: 'Unknown' };
  };
  
  // Check if we have data to display
  const hasData = filteredProblems.length > 0 && filteredSolutions.length > 0;
  
  return (
    <>
      <div className="w-full bg-gray-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Problem-Solution Matrix</h3>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4 mr-1" />
                Help
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  Understanding the Matrix
                </h4>
                <p className="text-sm text-muted-foreground">
                  This matrix helps you visualize the relationship between
                  problem significance and solution effectiveness. Focus on
                  high-significance problems with high-effectiveness solutions.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="relative h-80 border bg-white rounded-md">
          {/* Y-axis label */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 font-medium">
            Solution Effectiveness
          </div>

          {/* X-axis label */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-xs text-gray-500 font-medium">
            Problem Significance
          </div>

          {/* Quadrant labels */}
          <div className="absolute top-2 left-2 text-xs font-medium text-gray-500">
            Low Value
          </div>
          <div className="absolute top-2 right-2 text-xs font-medium text-gray-500">
            Potential Value
          </div>
          <div className="absolute bottom-2 left-2 text-xs font-medium text-gray-500">
            Consider Value
          </div>
          <div className="absolute bottom-2 right-2 text-xs font-medium text-gray-500">
            High Value
          </div>

          {/* Dividing lines */}
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-300"></div>
          <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-gray-300"></div>

          {/* Plot problems and solutions */}
          {problems.map((problem) => {
            const problemSolutions = matrix.get(problem.id) || [];
            const significance = problem.significance || 50; // Default to 50 if null

            return (
              <React.Fragment key={problem.id}>
                {/* Problem dot */}
                <motion.div
                  className="absolute w-6 h-6 bg-blue-100 rounded-full border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-700 z-10"
                  style={{
                    left: `calc(${significance}% - 12px)`,
                    top: `calc(${100 - 50}% - 12px)`, // Use 50 as placeholder for now
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  whileHover={{ scale: 1.1 }}
                >
                  P
                </motion.div>

                {/* Solution dots */}
                {problemSolutions.map((solution) => (
                  <motion.div
                    key={solution.id}
                    className="absolute w-6 h-6 bg-green-100 rounded-full border-2 border-green-500 flex items-center justify-center text-xs font-bold text-green-700 z-20"
                    style={{
                      left: `calc(${significance}% - 12px)`,
                      top: `calc(${
                        100 - (solution.effectiveness || 50)
                      }% - 12px)`,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    S
                  </motion.div>
                ))}

                {/* Connection lines between problem and solutions */}
                {problemSolutions.map((solution) => (
                  <svg
                    key={`line-${problem.id}-${solution.id}`}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                  >
                    <line
                      x1={`${significance}%`}
                      y1={`${100 - 50}%`} // Use 50 as placeholder for now
                      x2={`${significance}%`}
                      y2={`${100 - (solution.effectiveness || 50)}%`}
                      stroke="#22c55e"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                  </svg>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Puzzle className="h-5 w-5 mr-2 text-primary" />
            Problem-Solution Matrix
          </CardTitle>
          <CardDescription>
            Overview of proposed solutions mapped to validated problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Problem</TableHead>
                  <TableHead>Solutions</TableHead>
                  <TableHead className="w-[100px]">Effectiveness</TableHead>
                  <TableHead className="w-[100px]">Feasibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProblems.map((problem) => {
                  const problemSolutions = matrix.get(problem.id) || [];

                  return (
                    <TableRow key={problem.id}>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div>{problem.title}</div>
                          <Badge
                            variant={
                              problem.status === "critical"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {problem.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {problemSolutions.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {problemSolutions.map((solution) => (
                              <li key={solution.id}>
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <span className="cursor-help border-b border-dotted border-gray-400">
                                      {solution.title}
                                    </span>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80">
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold">
                                        {solution.title}
                                      </h4>
                                      <p className="text-sm">
                                        {solution.description ||
                                          "No description provided"}
                                      </p>
                                      {solution.hypothesis_statement && (
                                        <div className="pt-2 border-t">
                                          <p className="text-xs text-muted-foreground">
                                            Hypothesis:
                                          </p>
                                          <p className="text-sm italic">
                                            {solution.hypothesis_statement}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No solutions proposed
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {problemSolutions.length > 0 ? (
                          <div className="space-y-2">
                            {problemSolutions.map((solution) => {
                              const effectiveness = getEffectivenessDisplay(
                                solution.effectiveness
                              );
                              return (
                                <div
                                  key={solution.id}
                                  className="flex items-center space-x-1"
                                >
                                  {effectiveness.icon}
                                  <span className="text-sm">
                                    {effectiveness.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {problemSolutions.length > 0 ? (
                          <div className="space-y-2">
                            {problemSolutions.map((solution) => {
                              const feasibility = getFeasibilityDisplay(
                                solution.feasibility
                              );
                              return (
                                <div
                                  key={solution.id}
                                  className="flex items-center space-x-1"
                                >
                                  {feasibility.icon}
                                  <span className="text-sm">
                                    {feasibility.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-2">
                <Info className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No Problem-Solution Data</h3>
              <p className="text-muted-foreground">
                Add validated problems and proposed solutions to populate this
                matrix
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
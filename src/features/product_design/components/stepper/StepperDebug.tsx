import React from 'react';
import { useProductStepper } from '@/context/product-stepper-context';
import { useProjectStore } from '@/store/project-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function StepperDebug() {
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  
  const {
    problems,
    solutions,
    evidence,
    features,
    selectedMVPFeatures,
    successCriteria,
    timeline,
    isLoading,
    addProblem,
    updateProblem,
    addSolution,
    addEvidence,
    addFeature,
    updateFeature,
    updateMVPScope,
  } = useProductStepper();

  // Create a test problem
  const handleAddTestProblem = async () => {
    try {
      await addProblem({
        title: `Test Problem ${Date.now()}`,
        description: 'This is a test problem created for debugging',
        status: 'discovered',
        significance: 75,
        customerSegments: ['Test Segment'],
        evidenceCount: 0
      });
    } catch (error) {
      console.error('Error adding test problem:', error);
    }
  };

  // Create a test solution
  const handleAddTestSolution = async () => {
    if (problems.length === 0) {
      alert('Please add a problem first');
      return;
    }
    
    try {
      await addSolution({
        title: `Test Solution ${Date.now()}`,
        description: 'This is a test solution created for debugging',
        problemId: problems[0].id,
        effectiveness: 70,
        feasibility: 60,
        hypothesisStatement: 'This is a test hypothesis statement'
      });
    } catch (error) {
      console.error('Error adding test solution:', error);
    }
  };

  // Create a test feature
  const handleAddTestFeature = async () => {
    try {
      await addFeature({
        name: `Test Feature ${Date.now()}`,
        description: 'This is a test feature created for debugging',
        priority: 'should',
        status: 'planned',
        tags: ['test']
      });
    } catch (error) {
      console.error('Error adding test feature:', error);
    }
  };

  if (isLoading) {
    return <div>Loading stepper data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Stepper Debug Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Project ID:</strong> {projectId || 'No project selected'}</p>
            <div className="flex space-x-2">
              <Button onClick={handleAddTestProblem} variant="outline" size="sm">Add Test Problem</Button>
              <Button onClick={handleAddTestSolution} variant="outline" size="sm">Add Test Solution</Button>
              <Button onClick={handleAddTestFeature} variant="outline" size="sm">Add Test Feature</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Problems */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Problems</span>
              <Badge>{problems.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {problems.map(problem => (
                <li key={problem.id} className="border p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{problem.title}</span>
                    <Badge variant={
                      problem.status === 'critical' ? 'destructive' : 
                      problem.status === 'validated' ? 'default' : 
                      'secondary'
                    }>
                      {problem.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{problem.description}</p>
                </li>
              ))}
              {problems.length === 0 && (
                <p className="text-muted-foreground">No problems found</p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Solutions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Solutions</span>
              <Badge>{solutions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {solutions.map(solution => (
                <li key={solution.id} className="border p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{solution.title}</span>
                    <div className="flex space-x-1">
                      <Badge variant="outline">E: {solution.effectiveness}</Badge>
                      <Badge variant="outline">F: {solution.feasibility}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{solution.description}</p>
                </li>
              ))}
              {solutions.length === 0 && (
                <p className="text-muted-foreground">No solutions found</p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Features</span>
              <Badge>{features.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {features.map(feature => (
                <li key={feature.id} className="border p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{feature.name}</span>
                    <div className="flex space-x-1">
                      <Badge variant={
                        feature.priority === 'must' ? 'destructive' : 
                        feature.priority === 'should' ? 'default' : 
                        feature.priority === 'could' ? 'secondary' :
                        'outline'
                      }>
                        {feature.priority}
                      </Badge>
                      <Badge variant="outline">{feature.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </li>
              ))}
              {features.length === 0 && (
                <p className="text-muted-foreground">No features found</p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* MVP Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>MVP Features</span>
              <Badge>{selectedMVPFeatures.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {selectedMVPFeatures.map(featureId => {
                const feature = features.find(f => f.id === featureId);
                return feature ? (
                  <li key={feature.id} className="border p-2 rounded-md">
                    <span className="font-medium">{feature.name}</span>
                  </li>
                ) : (
                  <li key={featureId} className="text-muted-foreground">
                    Invalid feature ID: {featureId}
                  </li>
                );
              })}
              {selectedMVPFeatures.length === 0 && (
                <p className="text-muted-foreground">No MVP features selected</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const OptimizationTips: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Optimization Recommendations</CardTitle>
        <CardDescription>
          Tips to reduce your AI usage costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc pl-5">
          <li>Use local models for frequent or routine tasks</li>
          <li>Reduce prompt length by being more concise</li>
          <li>Use smart chunking to optimize document indexing</li>
          <li>Limit the number of generated tokens by properly configuring your requests</li>
          <li>Use caching for similar queries to avoid duplication</li>
        </ul>
      </CardContent>
    </Card>
  );
};

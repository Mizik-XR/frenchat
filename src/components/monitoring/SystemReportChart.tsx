
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SystemReportProps {
  report: {
    metrics_summary: {
      total_operations: number;
      success_rate: number;
      avg_duration: number;
      error_count: number;
    };
    cache_stats: {
      hit_rate: number;
      miss_rate: number;
    };
  };
}

export const SystemReportChart = ({ report }: SystemReportProps) => {
  const data = [
    {
      name: 'Taux de succès',
      value: report.metrics_summary.success_rate,
      fill: report.metrics_summary.success_rate >= 95 ? '#22c55e' : '#f59e0b',
      unit: '%'
    },
    {
      name: 'Temps moyen',
      value: report.metrics_summary.avg_duration,
      fill: report.metrics_summary.avg_duration < 1000 ? '#3b82f6' : '#f59e0b',
      unit: 'ms'
    },
    {
      name: 'Utilisation cache',
      value: report.cache_stats.hit_rate,
      fill: '#8b5cf6',
      unit: '%'
    }
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name, props) => [`${value}${props.payload.unit}`, props.payload.name]}
            />
            <Legend />
            <Bar dataKey="value" name="Valeur" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


import React from '@/core/reactInstance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HistoricalUsage } from "./types";
import { formatNumber } from "./utils";

interface HistoricalChartProps {
  historicalUsage: HistoricalUsage[];
  chartView: 'tokens' | 'cost';
  setChartView: (view: 'tokens' | 'cost') => void;
}

export const HistoricalChart: React.FC<HistoricalChartProps> = ({ 
  historicalUsage, 
  chartView, 
  setChartView 
}) => {
  return (
    <>
      <div className="flex justify-end mb-4 space-x-2">
        <Button 
          variant={chartView === 'tokens' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setChartView('tokens')}
        >
          Tokens
        </Button>
        <Button 
          variant={chartView === 'cost' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setChartView('cost')}
        >
          Coûts
        </Button>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={historicalUsage}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={6}
              angle={-45}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <RechartsTooltip 
              formatter={(value: number) => [
                chartView === 'tokens' 
                  ? `${formatNumber(value)} tokens` 
                  : `$${value.toFixed(2)}`,
                chartView === 'tokens' ? 'Tokens utilisés' : 'Coût estimé'
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey={chartView === 'tokens' ? 'tokens' : 'cost'} 
              name={chartView === 'tokens' ? 'Tokens utilisés' : 'Coût estimé ($)'} 
              fill={chartView === 'tokens' ? "#8884d8" : "#82ca9d"} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Tokens moyens par jour</h3>
              <p className="text-2xl font-bold">
                {formatNumber(Math.round(historicalUsage.reduce((sum, day) => sum + day.tokens, 0) / historicalUsage.length))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Coût moyen par jour</h3>
              <p className="text-2xl font-bold">
                ${(historicalUsage.reduce((sum, day) => sum + day.cost, 0) / historicalUsage.length).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

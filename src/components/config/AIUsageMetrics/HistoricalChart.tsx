
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface HistoricalChartProps {
  usageData: {
    date: Date;
    tokensInput: number;
    tokensOutput: number;
    costEstimated: number;
    provider: string;
  }[];
  isLoading?: boolean;
}

export const HistoricalChart = ({ usageData, isLoading = false }: HistoricalChartProps) => {
  const [timeframe, setTimeframe] = useState('7d');

  // Format data for chart
  const getFormattedData = () => {
    if (!usageData || usageData.length === 0) return [];

    // Group by date
    const groupedByDate = usageData.reduce((acc, item) => {
      const dateStr = item.date.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          tokensInput: 0,
          tokensOutput: 0,
          cost: 0
        };
      }
      acc[dateStr].tokensInput += item.tokensInput;
      acc[dateStr].tokensOutput += item.tokensOutput;
      acc[dateStr].cost += item.costEstimated;
      return acc;
    }, {} as Record<string, { date: string; tokensInput: number; tokensOutput: number; cost: number }>);

    // Convert to array and sort by date
    return Object.values(groupedByDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      }))
      .slice(-getDaysForTimeframe(timeframe));
  };

  const getDaysForTimeframe = (timeframe: string) => {
    switch (timeframe) {
      case '7d': return 7;
      case '14d': return 14;
      case '30d': return 30;
      default: return 7;
    }
  };

  const chartData = getFormattedData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Historique d'utilisation</CardTitle>
          <div className="w-[120px] h-9 bg-muted rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Chargement des données...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Historique d'utilisation</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 jours</SelectItem>
            <SelectItem value="14d">14 jours</SelectItem>
            <SelectItem value="30d">30 jours</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-80">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible pour cette période
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}`, ""]} />
              <Legend />
              <Bar name="Tokens Entrée" dataKey="tokensInput" fill="#8884d8" />
              <Bar name="Tokens Sortie" dataKey="tokensOutput" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

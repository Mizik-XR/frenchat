
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from "@/components/ui/button";

interface ChartGeneratorProps {
  data: string; // Données CSV
  onGenerate: (imageUrl: string) => void;
}

export const ChartGenerator = ({ data, onGenerate }: ChartGeneratorProps) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [processedData, setProcessedData] = useState<any[]>([]);

  const processCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = isNaN(Number(values[index])) ? values[index].trim() : Number(values[index]);
      });
      return obj;
    });
  };

  const handleGenerate = () => {
    const chartData = processCSV(data);
    setProcessedData(chartData);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const captureChart = () => {
    const svg = document.querySelector('.chart-container svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = svg.clientWidth;
        canvas.height = svg.clientHeight;
        ctx?.drawImage(img, 0, 0);
        const imgUrl = canvas.toDataURL('image/png');
        onGenerate(imgUrl);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2">
        <Button
          variant={chartType === 'bar' ? 'default' : 'outline'}
          onClick={() => setChartType('bar')}
        >
          Histogramme
        </Button>
        <Button
          variant={chartType === 'pie' ? 'default' : 'outline'}
          onClick={() => setChartType('pie')}
        >
          Camembert
        </Button>
      </div>

      <div className="h-[300px] chart-container">
        {processedData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(processedData[0])[0]} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={Object.keys(processedData[0])[1]} fill="#8884d8" />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={processedData}
                  nameKey={Object.keys(processedData[0])[0]}
                  dataKey={Object.keys(processedData[0])[1]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleGenerate}>Analyser les données</Button>
        {processedData.length > 0 && (
          <Button onClick={captureChart}>Générer l'image</Button>
        )}
      </div>
    </div>
  );
};

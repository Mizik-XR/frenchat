
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
  Cell,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ChartGeneratorProps {
  data: string; // Données CSV
  onGenerate: (imageUrl: string) => void;
}

export const ChartGenerator = ({ data, onGenerate }: ChartGeneratorProps) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'scatter'>('bar');
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [xAxisKey, setXAxisKey] = useState<string>('');
  const [yAxisKey, setYAxisKey] = useState<string>('');
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [dataKeys, setDataKeys] = useState<string[]>([]);

  const processCSV = (csv: string) => {
    const validation: string[] = [];
    const lines = csv.trim().split('\n');
    
    if (lines.length < 2) {
      validation.push("Les données doivent contenir au moins une ligne d'en-tête et une ligne de données");
      setValidationMessages(validation);
      return [];
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    setDataKeys(headers);
    
    // Par défaut, utiliser la première colonne comme axe X et la deuxième comme axe Y
    if (headers.length >= 2 && !xAxisKey && !yAxisKey) {
      setXAxisKey(headers[0]);
      setYAxisKey(headers[1]);
    }
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      
      if (values.length !== headers.length) {
        validation.push(`La ligne "${line}" a un nombre incorrect de valeurs`);
      }
      
      headers.forEach((header, index) => {
        const value = values[index] ? values[index].trim() : '';
        obj[header] = isNaN(Number(value)) ? value : Number(value);
        
        // Vérifier si les valeurs numériques sont cohérentes pour les graphiques
        if (header === yAxisKey && isNaN(Number(value)) && value !== '') {
          validation.push(`Valeur non numérique "${value}" trouvée dans la colonne ${header}`);
        }
      });
      
      return obj;
    });
    
    setValidationMessages(validation);
    return data;
  };

  const handleGenerate = () => {
    const chartData = processCSV(data);
    setProcessedData(chartData);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

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
      
      // Convertir SVG en base64
      const encodedData = window.btoa(unescape(encodeURIComponent(svgData)));
      img.src = 'data:image/svg+xml;base64,' + encodedData;
    }
  };

  const renderChart = () => {
    if (processedData.length === 0 || !xAxisKey || !yAxisKey) return null;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxisKey} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                nameKey={xAxisKey}
                dataKey={yAxisKey}
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yAxisKey} stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} type="number" name={xAxisKey} />
              <YAxis dataKey={yAxisKey} type="number" name={yAxisKey} />
              <ZAxis range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Données" data={processedData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-medium">Générateur de graphiques</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="chart-type">Type de graphique</Label>
          <Select 
            value={chartType} 
            onValueChange={(value: any) => setChartType(value)}
          >
            <SelectTrigger id="chart-type">
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Histogramme</SelectItem>
              <SelectItem value="pie">Camembert</SelectItem>
              <SelectItem value="line">Courbe</SelectItem>
              <SelectItem value="scatter">Nuage de points</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {dataKeys.length > 0 && (
          <>
            <div>
              <Label htmlFor="x-axis">Axe X</Label>
              <Select 
                value={xAxisKey} 
                onValueChange={setXAxisKey}
              >
                <SelectTrigger id="x-axis">
                  <SelectValue placeholder="Sélectionner une colonne" />
                </SelectTrigger>
                <SelectContent>
                  {dataKeys.map(key => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="y-axis">Axe Y</Label>
              <Select 
                value={yAxisKey} 
                onValueChange={setYAxisKey}
              >
                <SelectTrigger id="y-axis">
                  <SelectValue placeholder="Sélectionner une colonne" />
                </SelectTrigger>
                <SelectContent>
                  {dataKeys.map(key => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {validationMessages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-amber-600">Problèmes détectés :</p>
          <ul className="space-y-1">
            {validationMessages.map((message, idx) => (
              <li key={idx}>
                <Badge variant="outline" className="w-fit text-amber-600 border-amber-300 bg-amber-50">
                  {message}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="h-[300px] chart-container bg-gray-50 rounded-md flex items-center justify-center">
        {processedData.length > 0 ? (
          renderChart()
        ) : (
          <p className="text-gray-400">Cliquez sur "Analyser les données" pour générer le graphique</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleGenerate} variant="default">
          Analyser les données
        </Button>
        {processedData.length > 0 && (
          <Button onClick={captureChart} variant="outline">
            Générer l'image
          </Button>
        )}
      </div>
    </div>
  );
};

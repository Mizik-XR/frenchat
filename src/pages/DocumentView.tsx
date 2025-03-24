
import { useEffect, useState  } from '@/core/reactInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<{ id: string; title: string; content: string } | null>(null);

  useEffect(() => {
    // Simulation de chargement de document
    const timer = setTimeout(() => {
      setDocument({
        id: id || '0',
        title: `Document ${id}`,
        content: 'Contenu du document...'
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <p>Chargement du document...</p>
        </div>
      ) : document ? (
        <Card>
          <CardHeader>
            <CardTitle>{document.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p>{document.content}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Document introuvable</h2>
          <p className="mt-2 text-gray-500">Le document que vous cherchez n'existe pas.</p>
        </div>
      )}
    </div>
  );
}

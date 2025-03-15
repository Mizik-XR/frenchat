
import React from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertCircle,
  BadgeCheck
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type FeatureStatus = 'completed' | 'in-progress' | 'planned' | 'critical';

interface RoadmapItem {
  feature: string;
  description: string;
  phase: number;
  status: FeatureStatus;
  timeline: string;
  priority: 'Critique' | 'Haute' | 'Moyenne' | 'Basse';
}

const roadmapData: RoadmapItem[] = [
  // Phase 1: Fondations et Corrections
  {
    feature: 'Corrections de Sécurité',
    description: 'Politiques RLS, chiffrement des API keys, correction des erreurs TypeScript',
    phase: 1,
    status: 'in-progress',
    timeline: 'Q2 2024',
    priority: 'Critique'
  },
  {
    feature: 'Installation Simplifiée',
    description: 'Script unifié pour Ollama, Python et Mistral, assistant de première connexion',
    phase: 1,
    status: 'completed',
    timeline: 'Q1 2024',
    priority: 'Critique'
  },
  {
    feature: 'Optimisations Essentielles',
    description: 'Indexation par lots, système de cache, bascule automatique local/cloud',
    phase: 1,
    status: 'in-progress',
    timeline: 'Q2 2024',
    priority: 'Critique'
  },
  {
    feature: 'Bot IA d\'assistance',
    description: 'Assistant intégré formé sur la documentation technique et juridique',
    phase: 1,
    status: 'planned',
    timeline: 'Q3 2024',
    priority: 'Critique'
  },
  
  // Phase 2: Fonctionnalités Clés
  {
    feature: 'Intégration LangChain',
    description: 'Abstraction pour LLMs, modèles Mistral, gestion de mémoire conversationnelle',
    phase: 2,
    status: 'planned',
    timeline: 'Q3 2024',
    priority: 'Haute'
  },
  {
    feature: 'Amélioration de l\'Interface',
    description: 'Interface inspirée des meilleures pratiques, éditeur riche, export avancé',
    phase: 2,
    status: 'in-progress',
    timeline: 'Q2-Q3 2024',
    priority: 'Haute'
  },
  {
    feature: 'Sécurité Avancée',
    description: 'Rotation des clés, révocation automatique des tokens, journalisation détaillée',
    phase: 2,
    status: 'planned',
    timeline: 'Q3 2024',
    priority: 'Haute'
  },
  
  // Phase 3: Expansion
  {
    feature: 'Intégration Multi-modèles',
    description: 'Support pour Guidance, Transformers Agents, système de crédits',
    phase: 3,
    status: 'planned',
    timeline: 'Q4 2024',
    priority: 'Moyenne'
  },
  {
    feature: 'Fonctionnalités Collaboratives',
    description: 'Collaboration en temps réel, partage de conversations, commentaires',
    phase: 3,
    status: 'planned',
    timeline: 'Q4 2024',
    priority: 'Moyenne'
  },
  
  // Phase 4: Raffinement
  {
    feature: 'Expérience Utilisateur Avancée',
    description: 'Templates de documents, tableau de bord personnalisé, personnalisation',
    phase: 4,
    status: 'planned',
    timeline: 'Q1 2025',
    priority: 'Basse'
  },
  {
    feature: 'Intégrations Supplémentaires',
    description: 'Support pour Microsoft Teams/OneDrive, stockage cloud, gestion de projet',
    phase: 4,
    status: 'planned',
    timeline: 'Q1-Q2 2025',
    priority: 'Basse'
  }
];

const getStatusBadge = (status: FeatureStatus) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>Terminé</span>
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>En cours</span>
        </Badge>
      );
    case 'critical':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Critique</span>
        </Badge>
      );
    case 'planned':
    default:
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Planifié</span>
        </Badge>
      );
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critique':
      return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    case 'Haute':
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
    case 'Moyenne':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    case 'Basse':
    default:
      return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const RoadmapSection: React.FC = () => {
  return (
    <div className="py-12 md:py-16 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <MapPin className="h-8 w-8 text-purple-400" />
            <span>Notre Roadmap</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Découvrez les fonctionnalités prévues pour Frenchat. Nous travaillons continuellement à améliorer
            l'application et à ajouter de nouvelles fonctionnalités.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((phase) => (
            <Card key={phase} className="bg-gray-800/60 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white">
                  Phase {phase}
                  {phase === 1 && ": Fondations"}
                  {phase === 2 && ": Fonctionnalités Clés"}
                  {phase === 3 && ": Expansion"}
                  {phase === 4 && ": Raffinement"}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {phase === 1 && "Base solide et sécurisée"}
                  {phase === 2 && "Expérience utilisateur améliorée"}
                  {phase === 3 && "Nouvelles intégrations"}
                  {phase === 4 && "Perfection des détails"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-400 flex justify-between">
                  <span>
                    {phase === 1 && "Q1-Q3 2024"}
                    {phase === 2 && "Q2-Q4 2024"}
                    {phase === 3 && "Q4 2024"}
                    {phase === 4 && "Q1-Q2 2025"}
                  </span>
                  <span>
                    {roadmapData.filter(item => item.phase === phase && item.status === 'completed').length} / {roadmapData.filter(item => item.phase === phase).length} terminé
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                    style={{ 
                      width: `${(roadmapData.filter(item => item.phase === phase && item.status === 'completed').length / 
                              roadmapData.filter(item => item.phase === phase).length) * 100}%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800/60">
          <Table>
            <TableCaption>Plan de développement mis à jour au {new Date().toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}</TableCaption>
            <TableHeader className="bg-gray-900/70">
              <TableRow>
                <TableHead className="text-white">Fonctionnalité</TableHead>
                <TableHead className="text-white">Description</TableHead>
                <TableHead className="text-white">Phase</TableHead>
                <TableHead className="text-white">Priorité</TableHead>
                <TableHead className="text-white">Planning</TableHead>
                <TableHead className="text-white">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roadmapData.map((item, index) => (
                <TableRow key={index} className="border-gray-700 hover:bg-gray-700/30">
                  <TableCell className="font-medium text-white">{item.feature}</TableCell>
                  <TableCell className="text-gray-300 max-w-md">{item.description}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-purple-900/20 text-purple-400 hover:bg-purple-900/30">
                      Phase {item.phase}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-300">{item.timeline}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Ce roadmap est un document vivant et sera mis à jour régulièrement en fonction de vos retours.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-300">Terminé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-300">En cours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-sm text-gray-300">Planifié</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-300">Critique</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapSection;

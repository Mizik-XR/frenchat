
import React from '@/core/reactInstance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Lock, Zap, Brain, Cloud, Server } from "lucide-react";
import { motion } from "framer-motion";

export function BestPracticesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Guide des bonnes pratiques</h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Comprendre les coûts, la sécurité et l'optimisation de votre expérience IA pour une utilisation efficace de Frenchat.
          </p>
        </motion.div>

        <Tabs defaultValue="costs" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="costs">Coûts API</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="optimization">Optimisation</TabsTrigger>
            <TabsTrigger value="models">Choix des modèles</TabsTrigger>
          </TabsList>

          <TabsContent value="costs" className="mt-4">
            <Card className="border border-gray-800 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Comprendre les coûts d'utilisation des API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-6">
                  Les modèles d'IA fonctionnent sur la base de "tokens" - unités de traitement de texte. 
                  Les coûts varient considérablement selon le fournisseur et le modèle choisi.
                </p>

                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Fournisseur</TableHead>
                      <TableHead className="text-gray-400">Modèle</TableHead>
                      <TableHead className="text-gray-400">Coût par 1K tokens (entrée)</TableHead>
                      <TableHead className="text-gray-400">Coût par 1K tokens (sortie)</TableHead>
                      <TableHead className="text-gray-400">Contexte max</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-800">
                      <TableCell className="text-white">OpenAI</TableCell>
                      <TableCell>GPT-4o</TableCell>
                      <TableCell>$0.010</TableCell>
                      <TableCell>$0.030</TableCell>
                      <TableCell>128K</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-800">
                      <TableCell className="text-white">OpenAI</TableCell>
                      <TableCell>GPT-4o-mini</TableCell>
                      <TableCell>$0.002</TableCell>
                      <TableCell>$0.006</TableCell>
                      <TableCell>128K</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-800">
                      <TableCell className="text-white">Anthropic</TableCell>
                      <TableCell>Claude 3 Opus</TableCell>
                      <TableCell>$0.015</TableCell>
                      <TableCell>$0.075</TableCell>
                      <TableCell>200K</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-800">
                      <TableCell className="text-white">Mistral AI</TableCell>
                      <TableCell>Mistral Large</TableCell>
                      <TableCell>$0.006</TableCell>
                      <TableCell>$0.018</TableCell>
                      <TableCell>32K</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-800">
                      <TableCell className="text-white">HuggingFace</TableCell>
                      <TableCell>Modèles ouverts</TableCell>
                      <TableCell>$0.0001-0.0005</TableCell>
                      <TableCell>$0.0001-0.0005</TableCell>
                      <TableCell>Variable</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-800">
                      <TableCell className="text-white">Ollama (Local)</TableCell>
                      <TableCell>Tous modèles</TableCell>
                      <TableCell>$0.00</TableCell>
                      <TableCell>$0.00</TableCell>
                      <TableCell>Variable</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-8 space-y-4 text-gray-400">
                  <h3 className="text-lg font-medium text-white">Pourquoi ces services sont-ils payants ?</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Les modèles d'IA avancés nécessitent d'importantes ressources matérielles pour fonctionner (GPU, serveurs)</li>
                    <li>La recherche et le développement continus pour améliorer ces modèles sont coûteux</li>
                    <li>Les infrastructures d'IA à grande échelle consomment beaucoup d'énergie</li>
                    <li>Les services cloud garantissent haute disponibilité et mises à jour régulières</li>
                  </ul>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-800">
                  <p className="text-gray-400 text-sm italic">
                    * Les prix sont indicatifs et peuvent varier. Dernière mise à jour: Août 2023
                  </p>
                  <a href="https://docs.lovable.dev/user-guides/ai-cost-optimization" className="text-blue-400 flex items-center text-sm hover:underline">
                    Guide d'optimisation des coûts <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card className="border border-gray-800 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Sécurité des données</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg border border-gray-800 bg-black/30">
                    <div className="flex items-center mb-3">
                      <Cloud className="text-blue-500 mr-3 h-5 w-5" />
                      <h3 className="text-lg font-medium text-white">Mode Cloud</h3>
                    </div>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li>• Les données transitent par les serveurs des fournisseurs d'API</li>
                      <li>• Certains services conservent vos données pour améliorer leurs modèles</li>
                      <li>• Garantie de chiffrement en transit et au repos</li>
                      <li>• Conformité RGPD variable selon les fournisseurs</li>
                      <li>• Possibilité de demander la suppression des données</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-800 bg-black/30">
                    <div className="flex items-center mb-3">
                      <Server className="text-green-500 mr-3 h-5 w-5" />
                      <h3 className="text-lg font-medium text-white">Mode Local</h3>
                    </div>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li>• Aucune donnée ne quitte votre ordinateur</li>
                      <li>• Confidentialité totale des informations sensibles</li>
                      <li>• Aucun risque de fuite de données</li>
                      <li>• Conformité RGPD simplifiée</li>
                      <li>• Fonctionnement même hors ligne</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-gray-800 bg-black/30">
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                    <Lock className="text-red-400 mr-2 h-5 w-5" />
                    Bonnes pratiques de sécurité
                  </h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>• Utilisez Ollama ou les modèles locaux pour les données sensibles</li>
                    <li>• Vérifiez les politiques de confidentialité des fournisseurs d'API</li>
                    <li>• Optez pour des fournisseurs garantissant la non-conservation des données</li>
                    <li>• Limitez les informations personnelles dans vos prompts et documents</li>
                    <li>• Utilisez un VPN pour les connexions aux API cloud si nécessaire</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="mt-4">
            <Card className="border border-gray-800 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Optimisation de l'IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center">
                      <Zap className="text-yellow-500 mr-2 h-5 w-5" />
                      Optimiser la performance
                    </h3>
                    <ul className="space-y-2 text-gray-400">
                      <li>• Utilisez des chunks de document de taille optimale (1000-2000 tokens)</li>
                      <li>• Configurez la température entre 0.1-0.3 pour les tâches précises</li>
                      <li>• Activez le cache pour éviter les requêtes répétitives</li>
                      <li>• Utilisez le traitement par lots pour les analyses multiples</li>
                      <li>• Limitez le contexte aux informations essentielles uniquement</li>
                    </ul>

                    <h3 className="text-lg font-medium text-white mt-6 flex items-center">
                      <Brain className="text-purple-500 mr-2 h-5 w-5" />
                      Équilibre coût/performance
                    </h3>
                    <ul className="space-y-2 text-gray-400">
                      <li>• Commencez avec des modèles plus légers, passez aux plus grands si nécessaire</li>
                      <li>• Utilisez des modèles spécialisés pour des tâches spécifiques</li>
                      <li>• Réduisez la longueur maximale de génération quand possible</li>
                      <li>• Supprimez les tokens inutiles dans les entrées (formatage, espaces)</li>
                      <li>• Utilisez des embeddings denses et optimisés pour le RAG</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center">
                      <Server className="text-blue-500 mr-2 h-5 w-5" />
                      Mode hybride optimisé
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Le mode hybride combine intelligemment l'IA locale et cloud pour maximiser 
                      l'efficacité tout en minimisant les coûts et en préservant la confidentialité.
                    </p>

                    <div className="space-y-3 text-gray-400">
                      <div className="p-3 rounded border border-gray-800 bg-black/20">
                        <strong className="text-white">Utilisation locale recommandée pour:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                          <li>Tâches routinières et répétitives</li>
                          <li>Documents confidentiels et personnels</li>
                          <li>Sessions de brainstorming préliminaires</li>
                          <li>Génération de contenus bruts</li>
                        </ul>
                      </div>

                      <div className="p-3 rounded border border-gray-800 bg-black/20">
                        <strong className="text-white">Utilisation cloud recommandée pour:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                          <li>Tâches nécessitant une haute précision</li>
                          <li>Analyses complexes et nuancées</li>
                          <li>Recherche d'informations spécifiques</li>
                          <li>Génération de contenu final de qualité</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded border border-gray-800 bg-black/20">
                      <h4 className="text-white font-medium mb-2">Ressources d'optimisation</h4>
                      <ul className="space-y-1 text-blue-400 text-sm">
                        <li>
                          <a href="/docs/ai-models" className="hover:underline flex items-center">
                            Guide détaillé des modèles d'IA <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </li>
                        <li>
                          <a href="https://ollama.ai/library" className="hover:underline flex items-center">
                            Bibliothèque de modèles Ollama <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </li>
                        <li>
                          <a href="https://huggingface.co/models" className="hover:underline flex items-center">
                            Modèles HuggingFace <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="mt-4">
            <Card className="border border-gray-800 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Choisir le bon modèle d'IA</CardTitle>
              </CardHeader>
              <CardContent>
                <Table className="mb-6">
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Critère</TableHead>
                      <TableHead className="text-gray-400">Modèles recommandés</TableHead>
                      <TableHead className="text-gray-400">Mode</TableHead>
                      <TableHead className="text-gray-400">Avantages</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-800">
                      <TableCell className="font-medium text-white">Confidentialité maximale</TableCell>
                      <TableCell>Mistral 7B, Llama 2, Phi-2</TableCell>
                      <TableCell>Local (Ollama)</TableCell>
                      <TableCell>Aucune donnée ne quitte votre machine</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-800">
                      <TableCell className="font-medium text-white">Performance rapide</TableCell>
                      <TableCell>Phi-3-small, Mistral Tiny, Candle</TableCell>
                      <TableCell>Local/Cloud</TableCell>
                      <TableCell>Optimal pour tâches fréquentes</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-800">
                      <TableCell className="font-medium text-white">Haute précision</TableCell>
                      <TableCell>GPT-4o, Claude 3, Mistral Large</TableCell>
                      <TableCell>Cloud</TableCell>
                      <TableCell>Meilleure compréhension et génération</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-800">
                      <TableCell className="font-medium text-white">Ressources limitées</TableCell>
                      <TableCell>Phi-2, TinyLlama, Gemma 2B</TableCell>
                      <TableCell>Local</TableCell>
                      <TableCell>Fonctionne sur machines modestes</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-800">
                      <TableCell className="font-medium text-white">Analyse documentaire</TableCell>
                      <TableCell>Mistral Medium, GPT-4o mini, E5-large</TableCell>
                      <TableCell>Hybride</TableCell>
                      <TableCell>Bon équilibre coût/performance</TableCell>
                    </TableRow>
                    <TableRow className="border-gray-800">
                      <TableCell className="font-medium text-white">Code et développement</TableCell>
                      <TableCell>DeepSeek Coder, Codestral, Wizard Coder</TableCell>
                      <TableCell>Hybride</TableCell>
                      <TableCell>Spécialisés pour le code</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  <div className="p-4 rounded-lg border border-gray-800 bg-black/30">
                    <h3 className="text-lg font-medium text-white mb-3">Configuration recommandée</h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li><strong className="text-white">PC standard:</strong> Phi-2, Gemma 2B, TinyLlama</li>
                      <li><strong className="text-white">PC performant:</strong> Mistral 7B, Llama 2 7B, Phi-3</li>
                      <li><strong className="text-white">PC avec GPU:</strong> Mistral Medium, Llama 13B</li>
                      <li><strong className="text-white">Sans installation:</strong> HuggingFace API, GPT-4o mini</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-800 bg-black/30">
                    <h3 className="text-lg font-medium text-white mb-3">Cas d'utilisation spéciaux</h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li><strong className="text-white">Données sensibles:</strong> Modèles locaux uniquement</li>
                      <li><strong className="text-white">Multilinguisme:</strong> NLLB, Mistral, GPT-4o</li>
                      <li><strong className="text-white">Documents techniques:</strong> Modèles spécialisés en RAG</li>
                      <li><strong className="text-white">Vitesse critique:</strong> Candle, Phi-2, API optimisées</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-800 bg-black/30">
                    <h3 className="text-lg font-medium text-white mb-3">Paramètres clés</h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li><strong className="text-white">Température:</strong> 0.1-0.3 (précision), 0.7+ (créativité)</li>
                      <li><strong className="text-white">Top_p:</strong> 0.1-0.3 pour résultats déterministes</li>
                      <li><strong className="text-white">Max tokens:</strong> Réduire pour économiser des coûts</li>
                      <li><strong className="text-white">Quantization:</strong> GGUF 4-bit pour modèles locaux légers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

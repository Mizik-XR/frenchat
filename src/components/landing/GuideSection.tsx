
import { FileText, HelpCircle, Download, Terminal } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export function GuideSection() {
  return (
    <div className="py-16 bg-gradient-to-b from-black/90 to-black">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Guide d'Utilisation</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Suivez ces instructions pour installer et utiliser Frenchat efficacement
          </p>
        </div>
        
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              Installation
            </h3>
            
            <Card className="bg-gray-900/60 border-gray-800 text-white p-6">
              <div className="space-y-5">
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">Windows</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Téléchargez le fichier d'installation depuis le site officiel</li>
                    <li>Double-cliquez sur <code className="bg-gray-800 px-1 rounded text-blue-300">setup.bat</code> pour lancer l'installation</li>
                    <li>Suivez les instructions à l'écran</li>
                    <li>Une fois l'installation terminée, utilisez le raccourci créé sur votre bureau</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">macOS / Linux</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Téléchargez le fichier d'installation depuis le site officiel</li>
                    <li>Ouvrez un terminal dans le dossier d'installation</li>
                    <li>Exécutez la commande: <code className="bg-gray-800 px-1 rounded text-blue-300">chmod +x start-ai-service.sh && ./start-ai-service.sh</code></li>
                    <li>Suivez les instructions dans le terminal</li>
                  </ol>
                </div>
              </div>
            </Card>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-green-500" />
              Démarrage et utilisation
            </h3>
            
            <Card className="bg-gray-900/60 border-gray-800 text-white p-6">
              <div className="space-y-5">
                <div>
                  <h4 className="font-medium text-green-400 mb-2">Premier démarrage</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Lancez l'application via le raccourci ou le script de démarrage</li>
                    <li>Créez un compte ou connectez-vous</li>
                    <li>Suivez les instructions de l'assistant de configuration</li>
                    <li>Choisissez un modèle d'IA à utiliser (local ou cloud)</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium text-green-400 mb-2">Fonctionnalités principales</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Connectez-vous à Google Drive pour analyser vos documents</li>
                    <li>Posez des questions en langage naturel sur vos fichiers</li>
                    <li>Générez des résumés et des analyses de documents</li>
                    <li>Créez des visualisations à partir de vos données</li>
                    <li>Exportez les résultats vers Google Drive</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-500" />
            FAQ - Questions Fréquentes
          </h3>
          
          <Accordion type="single" collapsible className="bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden">
            <AccordionItem value="item-1" className="border-b border-gray-800">
              <AccordionTrigger className="px-6 py-4 text-white hover:bg-gray-800/50">
                Comment connecter mon compte Google Drive ?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-300">
                Allez dans les paramètres de l'application, cliquez sur "Connecter Google Drive", 
                puis suivez les instructions d'autorisation. Vous devrez accepter les permissions 
                demandées pour que l'application puisse accéder à vos fichiers.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border-b border-gray-800">
              <AccordionTrigger className="px-6 py-4 text-white hover:bg-gray-800/50">
                L'application fonctionne-t-elle sans connexion Internet ?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-300">
                Oui, une fois installée et configurée avec les modèles locaux, l'application peut 
                fonctionner sans connexion Internet. Cependant, les fonctionnalités liées à Google 
                Drive et aux modèles cloud nécessiteront une connexion.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border-b border-gray-800">
              <AccordionTrigger className="px-6 py-4 text-white hover:bg-gray-800/50">
                Comment puis-je résoudre des erreurs de démarrage ?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-300">
                Si vous rencontrez des erreurs de démarrage, essayez les solutions suivantes :
                <ul className="list-disc list-inside mt-2">
                  <li>Redémarrez l'application</li>
                  <li>Vérifiez que votre système répond aux exigences minimales</li>
                  <li>Exécutez le script de diagnostic : <code className="bg-gray-800 px-1 rounded text-blue-300">diagnostic.bat</code> (Windows) ou <code className="bg-gray-800 px-1 rounded text-blue-300">./scripts/unix/diagnostic.sh</code> (macOS/Linux)</li>
                  <li>Consultez les logs dans le dossier de l'application</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border-b border-gray-800">
              <AccordionTrigger className="px-6 py-4 text-white hover:bg-gray-800/50">
                Mes documents sont-ils envoyés à des serveurs externes ?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-300">
                Non, avec la configuration par défaut (modèle local), tous vos documents sont traités 
                localement sur votre ordinateur. Si vous choisissez d'utiliser un modèle cloud (OpenAI, etc.), 
                les extraits de documents pourraient être envoyés aux serveurs du fournisseur d'IA, mais cette 
                option est désactivée par défaut.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="px-6 py-4 text-white hover:bg-gray-800/50">
                Comment signaler un bug ou demander une fonctionnalité ?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-300">
                Pour signaler un bug ou demander une nouvelle fonctionnalité, utilisez le formulaire de feedback 
                dans l'application (menu Aide {'>'}  Signaler un problème) ou envoyez un email à l'équipe de support.
                Incluez autant de détails que possible, notamment les étapes pour reproduire le problème.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

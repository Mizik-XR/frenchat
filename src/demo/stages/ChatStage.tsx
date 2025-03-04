
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { STAGE_DETAILS } from '../constants';
import { useDemo } from '../DemoContext';
import { Send, User, Bot, FileText, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    title: string;
    preview: string;
  }[];
}

export const ChatStage = () => {
  const { currentStage, nextStage } = useDemo();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA FileChat. Comment puis-je vous aider avec vos documents aujourd\'hui ?'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    const newUserMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsTyping(true);

    // Simuler une réponse de l'IA après un délai
    setTimeout(() => {
      let response: Message;
      
      // Différentes réponses selon les questions
      if (input.toLowerCase().includes('rapport') || input.toLowerCase().includes('budget')) {
        response = {
          id: messages.length + 2,
          role: 'assistant',
          content: 'Selon le rapport financier du premier trimestre 2023, les revenus ont augmenté de 15% par rapport à l\'année précédente. Le budget prévisionnel pour l\'année 2023 prévoit une croissance continue avec des investissements dans de nouveaux marchés.',
          sources: [
            { 
              title: 'Rapport_Q1_2023.pdf', 
              preview: 'Page 3: "Les revenus ont augmenté de 15% par rapport à la même période l\'année dernière..."' 
            },
            { 
              title: 'Budget_2023.xlsx', 
              preview: 'Feuille "Prévisions": Ligne 42, colonne G - "Investissements nouveaux marchés: 1.2M€"' 
            }
          ]
        };
      } else if (input.toLowerCase().includes('présentation') || input.toLowerCase().includes('client')) {
        response = {
          id: messages.length + 2,
          role: 'assistant',
          content: 'La présentation client comprend une analyse détaillée des besoins du marché et propose une solution innovante adaptée à ces besoins. Elle a été présentée lors de la réunion du 15 mars 2023.',
          sources: [
            { 
              title: 'Présentation_client.pptx', 
              preview: 'Diapositive 12: "Analyse des besoins marché et solution proposée"' 
            },
            { 
              title: 'Notes_réunion.txt', 
              preview: 'Ligne 24: "Présentation approuvée lors de la réunion du 15/03/2023"' 
            }
          ]
        };
      } else {
        response = {
          id: messages.length + 2,
          role: 'assistant',
          content: 'D\'après les documents indexés, je ne trouve pas d\'information spécifique sur ce sujet. Pourriez-vous préciser votre question ou me demander des informations sur le rapport trimestriel, le budget ou la présentation client ?'
        };
      }
      
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-4">Dialogue avec vos documents</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {STAGE_DETAILS[currentStage]}
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden flex flex-col h-[500px]">
        <div className="border-b bg-gray-50 dark:bg-gray-800 p-3 flex justify-between items-center">
          <h4 className="font-medium">Chat FileChat</h4>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Conversations précédentes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sujets prioritaires</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <div className="border-b">
            <TabsList className="w-full justify-start h-10 rounded-none bg-transparent px-3">
              <TabsTrigger value="chat" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950">Chat</TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950">Documents</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {msg.role === 'user' ? 'Vous' : 'Assistant IA'}
                        </span>
                      </div>
                      <p>{msg.content}</p>
                      
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 border-t pt-2 text-sm">
                          <p className="font-medium mb-1">Sources:</p>
                          <div className="space-y-2">
                            {msg.sources.map((source, idx) => (
                              <div key={idx} className="flex items-start gap-1">
                                <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">{source.title}</p>
                                  <p className="text-xs opacity-80">{source.preview}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="font-medium">Assistant IA</span>
                      </div>
                      <div className="mt-1">
                        <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></span>
                        <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <form 
              onSubmit={handleSendMessage}
              className="border-t p-3 flex gap-2"
            >
              <Input
                placeholder="Posez une question sur vos documents..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="documents" className="p-4 m-0">
            <div className="grid grid-cols-1 gap-2">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Rapport_Q1_2023.pdf</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Indexé il y a 5 minutes</p>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Présentation_client.pptx</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Indexé il y a 5 minutes</p>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Budget_2023.xlsx</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Indexé il y a 5 minutes</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="text-center">
        <Button onClick={nextStage}>
          Terminer la démo
        </Button>
      </div>
    </div>
  );
};

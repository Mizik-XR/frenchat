
export interface OpenAIAssistantTool {
  type: 'code_interpreter' | 'retrieval' | 'function';
  function?: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface OpenAIAssistant {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  tools: OpenAIAssistantTool[];
  model: string;
  file_ids?: string[];
}

export interface OpenAIThread {
  id: string;
  object: string;
  created_at: number;
  metadata?: Record<string, any>;
}

export interface OpenAIMessage {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: 'user' | 'assistant';
  content: {
    type: 'text';
    text: {
      value: string;
      annotations?: any[];
    };
  }[];
  file_ids?: string[];
  assistant_id?: string;
  run_id?: string;
  metadata?: Record<string, any>;
}

export interface OpenAIRun {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'requires_action' | 'failed' | 'cancelled' | 'expired';
  required_action?: any;
  last_error?: {
    code: string;
    message: string;
  };
}


import { Json } from '@/types/database';

export interface Template {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  content_structure: Json;
}

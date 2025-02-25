import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib'
import * as XLSX from 'https://cdn.skypack.dev/xlsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/tiff'];
const BATCH_SIZE_DEFAULT = 100;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now();
  console.log('🔄 Début du traitement du document');

  try {
    const { fileId, mimeType, content, batchSize = BATCH_SIZE_DEFAULT } = await req.json()
    console.log(`📄 Type MIME: ${mimeType}, ID: ${fileId}`);

    if (!fileId || !mimeType || !content) {
      throw new Error('Paramètres manquants');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let extractedText = '';
    console.log(`🔍 Extraction du contenu pour le type: ${mimeType}`);

    // Traitement spécifique pour les images avec OCR
    if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
      const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))
      console.log('🖼️ Traitement OCR avec Donut');
      
      const result = await hf.documentQuestionAnswering({
        model: 'naver-clova-ix/donut-base-finetuned-cord-v2',
        inputs: {
          image: content,
          question: "Extract all text from this image"
        }
      });
      
      extractedText = result.answer;
      console.log('✅ OCR terminé avec succès');
    } else {
      // Réutilisation du code existant pour les autres types de documents
      switch (mimeType) {
        case 'application/pdf':
          extractedText = await extractTextFromPDF(content);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          extractedText = await extractTextFromDOCX(content);
          break;
        case 'text/plain':
        case 'application/json':
          extractedText = content;
          break;
          
        case 'text/csv':
          extractedText = await extractTextFromCSV(content);
          break;
          
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          extractedText = await extractTextFromPPTX(content);
          break;
          
        default:
          throw new Error(`Format non supporté: ${mimeType}`);
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Temps de traitement: ${processingTime}ms`);

    // Ajustement dynamique du batch size basé sur le temps de traitement
    const recommendedBatchSize = adjustBatchSize(processingTime, batchSize);

    // Mise à jour du document avec le texte extrait
    const { error: updateError } = await supabase
      .from('uploaded_documents')
      .update({ 
        content_text: extractedText,
        processing_time: processingTime,
        status: 'processed',
        metadata: {
          batch_size: recommendedBatchSize,
          processing_stats: {
            time: processingTime,
            chars: extractedText.length,
            timestamp: new Date().toISOString()
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)

    if (updateError) throw updateError;

    console.log('✅ Traitement terminé avec succès');

    return new Response(
      JSON.stringify({ 
        success: true, 
        processingTime,
        textLength: extractedText.length,
        recommendedBatchSize 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function adjustBatchSize(processingTime: number, currentBatchSize: number): number {
  const TARGET_PROCESSING_TIME = 30000; // 30 secondes
  const MIN_BATCH_SIZE = 10;
  const MAX_BATCH_SIZE = 500;

  if (processingTime > TARGET_PROCESSING_TIME) {
    // Réduire le batch size si le traitement est trop long
    return Math.max(MIN_BATCH_SIZE, Math.floor(currentBatchSize * 0.8));
  } else if (processingTime < TARGET_PROCESSING_TIME / 2) {
    // Augmenter le batch size si le traitement est rapide
    return Math.min(MAX_BATCH_SIZE, Math.floor(currentBatchSize * 1.2));
  }
  
  return currentBatchSize;
}

async function extractTextFromPDF(content: string): Promise<string> {
  console.log('📄 Extraction du texte depuis PDF');
  const pdfDoc = await PDFDocument.load(content);
  const pages = pdfDoc.getPages();
  return pages.map(page => page.getText()).join('\n');
}

async function extractTextFromDOCX(content: string): Promise<string> {
  console.log('📄 Extraction du texte depuis DOCX');
  // Note: Pour une implémentation complète, nous aurions besoin d'une bibliothèque
  // spécialisée pour le traitement des documents DOCX
  return content;
}

async function extractTextFromCSV(content: string): Promise<string> {
  try {
    const rows = content.split('\n').map(row => row.split(','));
    const headers = rows[0];
    let textContent = '';
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      textContent += headers.map((header, j) => `${header}: ${row[j]}`).join('\n') + '\n\n';
    }
    
    return textContent;
  } catch (error) {
    console.error('Erreur lors de l\'extraction du CSV:', error);
    throw error;
  }
}

async function extractTextFromPPTX(content: string): Promise<string> {
  // Note: Pour une implémentation complète, nous aurions besoin d'une bibliothèque
  // spécialisée pour le traitement des présentations PPTX
  return content;
}

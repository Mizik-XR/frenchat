
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib'
import * as XLSX from 'https://cdn.skypack.dev/xlsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now();
  console.log('🔄 Début du traitement du document');

  try {
    const { fileId, mimeType, content } = await req.json()
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

    switch (mimeType) {
      case 'application/pdf':
        extractedText = await extractTextFromPDF(content);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        extractedText = await extractTextFromDOCX(content);
        break;
      case 'text/csv':
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        extractedText = await extractTextFromSpreadsheet(content);
        break;
      case 'text/plain':
      case 'application/json':
        extractedText = content;
        break;
      case 'image/png':
      case 'image/jpeg':
      case 'image/tiff':
        extractedText = await extractTextFromImage(content);
        break;
      default:
        throw new Error(`Format non supporté: ${mimeType}`);
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Temps de traitement: ${processingTime}ms`);

    // Mise à jour du document avec le texte extrait
    const { error: updateError } = await supabase
      .from('uploaded_documents')
      .update({ 
        content_text: extractedText,
        processing_time: processingTime,
        status: 'processed',
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)

    if (updateError) throw updateError;

    console.log('✅ Traitement terminé avec succès');

    return new Response(
      JSON.stringify({ 
        success: true, 
        processingTime,
        textLength: extractedText.length 
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

async function extractTextFromSpreadsheet(content: string): Promise<string> {
  console.log('📊 Extraction du texte depuis tableur');
  const workbook = XLSX.read(content, { type: 'string' });
  let text = '';
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    text += `=== Feuille: ${sheetName} ===\n`;
    text += XLSX.utils.sheet_to_txt(sheet) + '\n\n';
  });
  return text;
}

async function extractTextFromImage(content: string): Promise<string> {
  console.log('🖼️ Extraction du texte depuis image');
  // Note: Pour une implémentation complète, nous aurions besoin d'une bibliothèque OCR
  return "Contenu de l'image - OCR non implémenté";
}

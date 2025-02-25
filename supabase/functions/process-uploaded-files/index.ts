
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

  try {
    const { fileId, mimeType } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer le fichier depuis la base de données
    const { data: file, error: fetchError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fetchError) throw fetchError

    let extractedText = ''
    
    // Extraction du contenu selon le type MIME
    switch (mimeType) {
      case 'application/pdf':
        extractedText = await extractTextFromPDF(file.content)
        break
      case 'text/csv':
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        extractedText = await extractTextFromSpreadsheet(file.content)
        break
      case 'text/plain':
      case 'application/json':
        extractedText = file.content
        break
      default:
        extractedText = await extractTextFromDocument(file.content)
    }

    // Mise à jour du document avec le texte extrait
    const { error: updateError } = await supabase
      .from('uploaded_documents')
      .update({ 
        content_text: extractedText,
        status: 'processed',
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, fileId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur lors du traitement du fichier:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function extractTextFromPDF(content: string): Promise<string> {
  // Implémentation basique pour l'exemple
  // À améliorer avec une bibliothèque PDF plus robuste
  const pdfDoc = await PDFDocument.load(content)
  const pages = pdfDoc.getPages()
  return pages.map(page => page.getText()).join('\n')
}

async function extractTextFromSpreadsheet(content: string): Promise<string> {
  const workbook = XLSX.read(content, { type: 'string' })
  let text = ''
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName]
    text += XLSX.utils.sheet_to_txt(sheet) + '\n'
  })
  return text
}

async function extractTextFromDocument(content: string): Promise<string> {
  // Implémentation par défaut - à améliorer selon les besoins
  return content
}

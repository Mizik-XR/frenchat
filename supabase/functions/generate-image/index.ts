
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, type } = await req.json()
    console.log(`Generating ${type} with prompt: ${prompt}`)
    
    // Utilisation du token Hugging Face
    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))

    if (type === 'chart') {
      // Pour les graphiques, on utilise un modèle spécialisé pour les visualisations
      const image = await hf.textToImage({
        inputs: `A professional ${prompt} chart or graph with clean design, data visualization`,
        model: 'black-forest-labs/FLUX.1-schnell',
        parameters: {
          negative_prompt: 'blurry, low quality, text, watermark',
        }
      })

      const arrayBuffer = await image.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      console.log('Chart generated successfully')
      return new Response(
        JSON.stringify({ image: `data:image/png;base64,${base64}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Pour les illustrations générales
      const image = await hf.textToImage({
        inputs: prompt,
        model: 'black-forest-labs/FLUX.1-schnell',
        parameters: {
          negative_prompt: 'blurry, low quality, watermark',
        }
      })

      const arrayBuffer = await image.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      console.log('Illustration generated successfully')
      return new Response(
        JSON.stringify({ image: `data:image/png;base64,${base64}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

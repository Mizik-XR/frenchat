
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    const { prompt, documentId, model = 'stabilityai/stable-diffusion-2-1' } = await req.json()
    const hf = new HfInference(Deno.env.get('HUGGINGFACE_API_KEY'))

    console.log('Generating image with prompt:', prompt)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Générer l'image avec Stable Diffusion
    const image = await hf.textToImage({
      inputs: prompt,
      model: model,
      parameters: {
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }
    })

    // Convertir le blob en base64
    const arrayBuffer = await image.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const imageUrl = `data:image/png;base64,${base64}`

    // Obtenir l'ID de l'utilisateur à partir du token JWT
    const authHeader = req.headers.get('Authorization')
    let userId = null

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (error) throw error
      userId = user?.id
    }

    // Sauvegarder l'image générée dans la base de données
    const { data, error } = await supabase
      .from('generated_images')
      .insert({
        prompt,
        image_url: imageUrl,
        model,
        user_id: userId,
        document_id: documentId,
        metadata: {
          engine: 'stable-diffusion',
          parameters: {
            steps: 30,
            guidance_scale: 7.5,
          }
        }
      })
      .select()
      .single()

    if (error) throw error

    console.log('Image generated and saved successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          ...data,
          image_url: imageUrl 
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating image:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

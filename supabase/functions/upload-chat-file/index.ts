import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const userId = req.headers.get('x-user-id')

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's Google Drive token
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Google Drive not connected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const oauth2Client = new OAuth2Client({
      clientId: Deno.env.get('GOOGLE_CLIENT_ID')!,
      clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
      authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUri: "https://oauth2.googleapis.com/token",
      redirectUri: `${Deno.env.get('SITE_URL')}/auth/callback/google`,
      defaults: {
        scope: ["https://www.googleapis.com/auth/drive.file"],
      },
    });

    // Set the tokens
    oauth2Client.setTokens({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });

    // Create the chat files folder if it doesn't exist
    const folderName = 'Chat Files';
    const folderSearchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const folderData = await folderSearchResponse.json();
    let folderId: string;

    if (folderData.files && folderData.files.length > 0) {
      folderId = folderData.files[0].id;
    } else {
      // Create the folder
      const createFolderResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
          }),
        }
      );
      const newFolder = await createFolderResponse.json();
      folderId = newFolder.id;
    }

    // Upload the file
    const metadata = {
      name: file.name,
      parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
        body: form,
      }
    );

    const uploadedFile = await uploadResponse.json();

    // Make the file accessible via link
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${uploadedFile.id}/permissions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      }
    );

    // Get the webViewLink
    const fileResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${uploadedFile.id}?fields=webViewLink`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );
    const fileData = await fileResponse.json();

    return new Response(
      JSON.stringify({ 
        message: 'File uploaded successfully', 
        fileName: file.name,
        publicUrl: fileData.webViewLink,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FileStats {
  totalFiles: number;
  totalSize: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw userError || new Error('User not found');
    }

    // Récupérer les statistiques des fichiers de l'utilisateur
    const { data: fileStats, error: statsError } = await supabase
      .from('indexed_documents')
      .select('file_size')
      .eq('user_id', user.id);

    if (statsError) {
      throw statsError;
    }

    const stats: FileStats = fileStats.reduce((acc, curr) => ({
      totalFiles: acc.totalFiles + 1,
      totalSize: acc.totalSize + (curr.file_size || 0)
    }), { totalFiles: 0, totalSize: 0 });

    // Limites configurées
    const FILE_LIMITS = {
      maxFiles: 1000,
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      maxTotalSize: 10 * 1024 * 1024 * 1000 // 10 GB
    };

    return new Response(
      JSON.stringify({
        stats,
        limits: FILE_LIMITS,
        canAddMore: stats.totalFiles < FILE_LIMITS.maxFiles,
        remainingFiles: FILE_LIMITS.maxFiles - stats.totalFiles,
        remainingSize: FILE_LIMITS.maxTotalSize - stats.totalSize
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

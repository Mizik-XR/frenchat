
-- Vérifier et créer uniquement les politiques manquantes
DO $$ 
BEGIN
    -- oauth_tokens policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'oauth_tokens' AND policyname = 'Users can view their own tokens') THEN
        CREATE POLICY "Users can view their own tokens"
        ON public.oauth_tokens FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'oauth_tokens' AND policyname = 'Users can update their own tokens') THEN
        CREATE POLICY "Users can update their own tokens"
        ON public.oauth_tokens FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'oauth_tokens' AND policyname = 'Users can insert their own tokens') THEN
        CREATE POLICY "Users can insert their own tokens"
        ON public.oauth_tokens FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- chat_conversations policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_conversations' AND policyname = 'Users can manage their own conversations') THEN
        CREATE POLICY "Users can manage their own conversations"
        ON public.chat_conversations FOR ALL
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    -- chat_messages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Users can manage their own messages') THEN
        CREATE POLICY "Users can manage their own messages"
        ON public.chat_messages FOR ALL
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    -- uploaded_documents policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'uploaded_documents' AND policyname = 'Users can manage their own documents') THEN
        CREATE POLICY "Users can manage their own documents"
        ON public.uploaded_documents FOR ALL
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Enable RLS on all tables if not already enabled
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS public.oauth_tokens ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.chat_conversations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.uploaded_documents ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

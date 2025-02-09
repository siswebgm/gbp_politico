import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cria uma única instância do cliente Supabase para toda a aplicação
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  }
});

// Re-exporta o cliente principal como default para manter compatibilidade
export default supabaseClient;
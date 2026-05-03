// supabase.js — Singleton Supabase client
// Import từ đây thay vì createClient riêng trong mỗi file
import { createClient } from "@supabase/supabase-js";

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const sb = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null;

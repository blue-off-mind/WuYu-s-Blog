import { createClient } from "@supabase/supabase-js";

// Hardcoded for stability in this environment
const supabaseUrl = "https://vcufajttjjflkmfkfikv.supabase.co";
const supabaseAnonKey = "sb_publishable_AruvHor89jwu7mXbCvIiaw_uqMzkXDq";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

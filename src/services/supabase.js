import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.SUPABASE_URL;

// JWT expiry time
export const jwtExpiry = process.env.JWT_EXPIRES_IN * 60 * 60 * 1000;

const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

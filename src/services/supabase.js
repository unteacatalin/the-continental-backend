import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://mbehgukaiafkgmqfeboa.supabase.co';

// JWT expiry time
export const jwtExpiry = 24 * 60 * 60 * 1000;

const supabaseKey = supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

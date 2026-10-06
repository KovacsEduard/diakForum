import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://odznhcwwkqcxvtdkcuyw.supabase.co'
const supabaseAnonKey = 'sb_publishable_kcp_us1pNYooYas9cl_GzA_9exu9C-p'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
// Supabase Configuration
export const SUPABASE_CONFIG = {
    searchFunctionUrl: 'https://ijhxupklqiwecembwaqf.supabase.co/functions/v1/search-kirtan',
    kirtanViewFunctionUrl: 'https://ijhxupklqiwecembwaqf.supabase.co/functions/v1/kirtan-view',
    updateFunctionUrl: 'https://ijhxupklqiwecembwaqf.supabase.co/functions/v1/update-kirtan',
    // TODO: Replace with your actual Supabase Anon Key
    // You can find this in your Supabase project settings under API
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaHh1cGtscWl3ZWNlbWJ3YXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODc2NDEsImV4cCI6MjA3OTc2MzY0MX0.qDur-k3KrbMOKp8_HGUVILOtSU7fpsS-dusyJiMYBIQ'
};

// export const SUPABASE_CONFIG = {
//     searchFunctionUrl: 'http://127.0.0.1:54321/functions/v1/search-kirtan',
//     kirtanViewFunctionUrl: 'http://127.0.0.1:54321/functions/v1/kirtan-view',
//     updateFunctionUrl: 'http://127.0.0.1:54321/functions/v1/update-kirtan',
//     // TODO: Replace with your actual Supabase Anon Key
//     // You can find this in your Supabase project settings under API
//     anonKey: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
// };


export default SUPABASE_CONFIG;

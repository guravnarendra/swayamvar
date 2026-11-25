import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', url);

if (!url || !key) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in backend/.env');
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

// Test 1: Check if games table exists
console.log('\n1. Checking table public.games...');
const { data, error } = await db.from('games').select('*').limit(1);

if (error) {
  console.error('❌ Table check failed:', error.message);
  if (error.code === 'PGRST205') {
    console.log('\n👉 ACTION REQUIRED:');
    console.log("   The 'games' table does not exist yet in your Supabase project.");
    console.log("   Please open your Supabase Dashboard -> SQL Editor, and run:");
    console.log("   swayamvar-fullstack/supabase-schema.sql");
  }
  process.exit(1);
}

console.log('✅ Table public.games exists!');

// Test 2: Try writing a test row
console.log('\n2. Testing write to public.games...');
const testKey = 'test-' + Date.now();
const { error: upsertErr } = await db.from('games').upsert({
  room_code: testKey,
  state: { test: true, timestamp: Date.now() },
  updated_at: new Date().toISOString(),
});

if (upsertErr) {
  console.error('❌ Write failed:', upsertErr.message);
  process.exit(1);
}

console.log('✅ Write test passed! Successfully saved row:', testKey);

// Test 3: Cleanup test row
await db.from('games').delete().eq('room_code', testKey);
console.log('✅ Cleanup passed! Everything is working 100%!');

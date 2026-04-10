import { writeFileSync } from 'node:fs';

const env = {
  APP_BASE_URL: process.env.APP_BASE_URL || '',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
};

const content = `window.__APP_ENV = ${JSON.stringify(env, null, 2)};\n`;
writeFileSync('env.js', content);
console.log('env.js généré');

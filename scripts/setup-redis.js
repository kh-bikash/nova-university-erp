#!/usr/bin/env node

/**
 * Quick script to update .env.local with Upstash Redis token
 * Usage: node scripts/setup-redis.js YOUR_UPSTASH_TOKEN
 */

const fs = require('fs');
const path = require('path');

const token = process.argv[2];

if (!token) {
  console.error('Error: Please provide your Upstash Redis token as an argument');
  console.error('Usage: node scripts/setup-redis.js YOUR_UPSTASH_TOKEN');
  console.error('\nTo get your token:');
  console.error('1. Go to https://console.upstash.com');
  console.error('2. Click on your "attendance-queue" database');
  console.error('3. Find "Token / Readonly Token" section');
  console.error('4. Click the eye icon to reveal the token');
  console.error('5. Copy and paste it here');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', '.env.local');
let envContent = fs.readFileSync(envPath, 'utf-8');

// Replace the placeholder with the actual token
envContent = envContent.replace(
  /REDIS_URL=redis:\/\/default:YOUR_UPSTASH_TOKEN@/,
  `REDIS_URL=redis://default:${token}@`
);

fs.writeFileSync(envPath, envContent);
console.log('✓ Updated .env.local with Upstash Redis token');
console.log('✓ Redis URL is now configured');
console.log('\nNext steps:');
console.log('1. Start the dev server: npm run dev');
console.log('2. In another terminal, start the worker: npm run worker:attendance');
console.log('3. Test by going to http://localhost:3000/faculty/attendance-marking');

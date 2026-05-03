#!/usr/bin/env node

// This script handles the PORT environment variable from Cloud Run
// while preserving backward compatibility with local development

const { spawn } = require('child_process');
const path = require('path');

// Get port from environment or default to 3000
const port = process.env.PORT || 3000;

// Set the PORT environment variable for the Next.js server
process.env.PORT = port;

// Start the Next.js standalone server
const serverPath = path.join(__dirname, 'server.js');
const child = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env,
});

// Handle process signals
process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});

// Exit with the child process exit code
child.on('exit', (code) => {
  process.exit(code);
});

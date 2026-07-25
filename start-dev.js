const { spawn } = require('child_process');
const path = require('path');

console.log("Starting Dehqon Market Full-Stack services...");

// Helper to pipe child process outputs with custom prefixes
function pipeOutput(child, name, colorCode) {
  const prefix = `\x1b[${colorCode}m[${name}]\x1b[0m`;
  
  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => console.log(`${prefix} ${line}`));
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => console.error(`${prefix} \x1b[31m${line}\x1b[0m`));
  });
}

// 1. Start Express Backend Server on Port 5000
const serverPath = path.join(__dirname, 'server');
console.log(`Launching server in: ${serverPath}`);
const server = spawn('npm', ['start'], { 
  cwd: serverPath,
  shell: true 
});
pipeOutput(server, 'Backend Server', '32'); // Green prefix

// 2. Start Vite Frontend Client
const clientPath = path.join(__dirname, 'client');
console.log(`Launching client in: ${clientPath}`);
const client = spawn('npm', ['run', 'dev'], { 
  cwd: clientPath,
  shell: true 
});
pipeOutput(client, 'Frontend Client', '36'); // Cyan prefix

// Handle exit events
process.on('SIGINT', () => {
  console.log("\nStopping all services...");
  server.kill();
  client.kill();
  process.exit();
});

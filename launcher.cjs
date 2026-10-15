const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

// Strip ELECTRON_RUN_AS_NODE if set in the caller terminal environment
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electron, ['.'], {
  cwd: __dirname,
  env,
  stdio: 'inherit',
  windowsHide: false,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});


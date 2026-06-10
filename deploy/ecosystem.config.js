const path = require('path');

module.exports = {
  apps: [
    {
      name: 'tfi-backend',
      script: path.join(__dirname, '..', 'backend', 'dist', 'main.js'),
      cwd: path.join(__dirname, '..', 'backend'),
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

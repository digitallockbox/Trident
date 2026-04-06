# PM2 ecosystem config for Trident backend
# Save as ecosystem.config.js in the server directory

module.exports = {
  apps: [
    {
      name: 'trident-backend',
      script: 'dist/lib/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      max_memory_restart: '512M',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-err.log',
      merge_logs: true
    }
  ]
};

module.exports = {
  apps: [
    {
      name: 'engiplex-consultation',
      script: './server/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};

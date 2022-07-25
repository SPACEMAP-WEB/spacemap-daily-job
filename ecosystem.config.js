module.exports = {
  apps: [
    {
      name: 'spacemap-daily-tasks',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      MODE: 'DEPLOYMENT',
      env: {
        NODE_ENV: 'deployment',
        SPACEMAP_NODE_ENV: 'deployment',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: true,
    },
    {
      name: 'spacemap-services-tasks',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      MODE: 'DEPLOYMENT',
      env: {
        NODE_ENV: 'deployment',
        SPACEMAP_NODE_ENV: 'deployment',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: true,
    },
  ],
};

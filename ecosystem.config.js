module.exports = {
  apps: [
    {
      name: 'spacemap-daily-tasks',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'deployment',
        MODE: 'DEPLOYMENT',
        SPACEMAP_NODE_ENV: 'deployment',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: false,
    },
    {
      name: 'spacemap-db-tasks',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'deployment',
        MODE: 'DEPLOYMENT',
        SPACEMAP_NODE_ENV: 'deployment',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: false,
    },
    {
      name: 'spacemap-services-tasks',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'deployment',
        MODE: 'DEPLOYMENT',
        SPACEMAP_NODE_ENV: 'deployment',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: false,
    },
  ],
};

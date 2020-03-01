module.exports = {
  apps : [{
    name: 'Search Algo API',
    script: './index.js',
    cwd: './',

    // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
    instances: "max",
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
};

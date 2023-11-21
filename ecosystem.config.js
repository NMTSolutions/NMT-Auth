module.exports = {
  apps: [
    {
      name: "nmt_auth",
      script: "./src/server.ts",
      env: {
        PORT: 5000,
      },
    },
  ],
};

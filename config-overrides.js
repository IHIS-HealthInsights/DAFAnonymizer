module.exports = {
  webpack: function (config) {
    // Worker loader must run before ts-loader: https://stackoverflow.com/questions/50210416/webpack-worker-loader-fails-to-compile-typescript-worker
    config.module.rules.shift({
      test: /\.worker\.ts$/,
      use: {
        loader: "worker-loader",
      },
    });
    // Fix: https://github.com/webpack-contrib/worker-loader/issues/176
    config.output.globalObject = "(self || this)";
    config.optimization.noEmitOnErrors = false;
    return config;
  },
};

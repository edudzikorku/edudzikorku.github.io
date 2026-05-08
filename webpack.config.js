const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    entry: "./src/globe.js",
    output: {
      filename: "js/globe.bundle.js",
      path: path.resolve(__dirname),
      clean: false,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env", { targets: "defaults" }]],
            },
          },
        },
        {
          // Webpack 5 native asset handling — no file-loader needed
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset/resource",
          generator: {
            filename: "img/[name][ext]",
          },
        },
      ],
    },
    optimization: {
      minimize: isProd,
      minimizer: [new TerserPlugin({ extractComments: false })],
    },
    devtool: isProd ? false : "source-map",
    devServer: {
      static: path.resolve(__dirname),
      port: 3000,
      open: true,
      hot: true,
    },
  };
};

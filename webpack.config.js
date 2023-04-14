const path = require("path");

module.exports = {
    entry: './src/index.js', // specify the entry point of your main.js file
    output: {
      filename: 'main.js', // specify the output file name
      path: __dirname // specify the output directory
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|jpg)$/i,
          use: {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext]",
              outputPath: "./asset",
            },
          }
        }
      ]
    }
  };
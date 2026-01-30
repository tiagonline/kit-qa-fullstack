const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// Eu removi a dependência de "webpack-node-externals" se ela não for essencial para o bundle web, 
// mas mantive a estrutura original focada em CommonJS.

module.exports = {
  mode: "production",
  entry: {
    // Eu ajustei o caminho para garantir que o __dirname funcione corretamente em CommonJS
    fullstack: path.resolve(__dirname, "./src/simulations/loadPerformanceFullstack.test.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs",
    filename: "[name].test.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: { node: "current" },
                  modules: false,
                },
              ],
            ],
          },
        },
      },
    ],
  },
  target: "web",
  externals: /^k6(\/.*)?/, 
  plugins: [
    new CleanWebpackPlugin(),
  ],
  stats: {
    colors: true,
  },
};
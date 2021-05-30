const path = require("path");
// const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: `./src/index.js`,
  mode: "production",
  // ファイルの出力設定
  output: {
    path: `${__dirname}/public`,
    publicPath: `${__dirname}/public/`,
    filename: "main.js",
  },
  devServer: {
    contentBase: "./public",
    open: true,
    hot: true,
    watchContentBase: true,
  },
  target: "web",
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     title: "Hot Module Replacement",
  //   }),
  // ],
};

const path = require("path");

module.exports = {
  entry: `./src/index.js`,
  mode: "development",
  // ファイルの出力設定
  output: {
    path: `${__dirname}/public`,
    publicPath: "${__dirname}/public/",
    filename: "main.js",
  },
  devServer: {
    contentBase: "public/",
    open: true,
    watchContentBase: true,
  },
  target: "web",
};

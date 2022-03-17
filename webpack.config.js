module.exports = {
  entry: {
    "fitting": "./src/index.js",
    "index": "./src/cross-section/index.js",
  },
  output: {
    path: `${__dirname}/public`,
    filename: "[name].js",
  },
  devServer: {
    static: {
      directory: require("path").resolve(__dirname, "public"),
      staticOptions: {},
      serveIndex: true,
      watch: true,
    },
  },
  target: "web",
};

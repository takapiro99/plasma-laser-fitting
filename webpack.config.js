module.exports = {
  entry: {
    main: "./src/index.js",
    "cross-section": "./src/cross-section/index.js"
  },
  output: {
    path: `${__dirname}/public`,
    filename: "[name].js",
  },
  devServer: {
    contentBase: `public/`,
    watchContentBase: true,
    open: true,
  },
  target: "web",
};

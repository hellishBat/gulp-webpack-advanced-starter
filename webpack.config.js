module.exports = {
  output: {
    filename: "[name].js",
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: "/node_modules/",
      loader: "babel-loader",
    }]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "initial",
        }
      }
    }
  },
};

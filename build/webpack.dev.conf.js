const { resolve } = require('./utils');
const merge = require('webpack-merge');
const webpack = require('webpack');
const baseConfig = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = merge(baseConfig, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('test')],
        options: {
          // emitWarning: true,
          cache: true,
          formatter: require('eslint-friendly-formatter'),
        },
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.less$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'postcss-loader',
          'less-loader',
        ],
      },
    ],
  },
  devtool: '#cheap-eval-source-map',
  devServer: {
    port: 9001,
    proxy: {
      '/v2': {
        target: 'https://petstore.swagger.io',
        changeOrigin: true,
      },
    },
    hot: true,
    overlay: {
      warnings: false,
      errors: true,
    },
    stats: {
      entrypoints: false,
      children: false,
      modules: false,
      warnings: false,
      assets: false,
      version: false,
      builtAt: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('index.html'),
      favicon: resolve('favicon.png'),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new StyleLintPlugin({
      configFile: resolve('.stylelintrc'),
      files: '**/*.{less,vue}'
    }),
  ],
});

const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const baseConfig = require('./webpack.base.conf');
const { resolve } = require('./utils');

const {
  PROXY = 'https://petstore.swagger.io',
  BASE_PATH = '/v2',
  PORT = 9001,
} = process.env;

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
    port: PORT,
    proxy: {
      [BASE_PATH]: {
        target: PROXY,
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
      files: '**/*.{less,vue}',
    }),
  ],
});

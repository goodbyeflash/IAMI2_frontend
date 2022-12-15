const Path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const htmlPageNames = [
  'main',
  'admin',
  'admin-member',
  'admin-member-edit',
  'admin-learningSet',
  'admin-learningSet-edit',
  'admin-learningInfo',
  'admin-learningInfo-edit',
  'admin-learningResult',
  'admin-quiz',
  'admin-quiz-edit',
  'admin-memo',
];

const multipleHtmlPlugins = htmlPageNames.map((name) => {
  return new HtmlWebpackPlugin({
    template: Path.resolve(__dirname, `../src/pages/${name}.html`), // relative path to the HTML files
    filename: `${name}.html`, // output HTML files
    chunks: [`${name}`], // respective JS files
  });
});

module.exports = {
  entry: {
    main: Path.resolve(__dirname, '../src/scripts/index.js'),
    admin: Path.resolve(__dirname, '../src/scripts/admin.js'),
    'admin-member': Path.resolve(__dirname, '../src/scripts/admin-member.js'),
    'admin-member-edit': Path.resolve(
      __dirname,
      '../src/scripts/admin-member-edit.js'
    ),
    'admin-learningSet': Path.resolve(
      __dirname,
      '../src/scripts/admin-learningSet.js'
    ),
    'admin-learningSet-edit': Path.resolve(
      __dirname,
      '../src/scripts/admin-learningSet-edit.js'
    ),
    'admin-learningInfo': Path.resolve(
      __dirname,
      '../src/scripts/admin-learningInfo.js'
    ),
    'admin-learningInfo-edit': Path.resolve(
      __dirname,
      '../src/scripts/admin-learningInfo-edit.js'
    ),
    'admin-learningResult': Path.resolve(
      __dirname,
      '../src/scripts/admin-learningResult.js'
    ),
    'admin-quiz': Path.resolve(__dirname, '../src/scripts/admin-quiz.js'),
    'admin-quiz-edit': Path.resolve(
      __dirname,
      '../src/scripts/admin-quiz-edit.js'
    ),
    'admin-memo': Path.resolve(__dirname, '../src/scripts/admin-memo.js'),
    // admin: Path.resolve(__dirname, '../src/scripts/admin.js'),
  },
  output: {
    path: Path.join(__dirname, '../build'),
    filename: 'js/[name].js',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: Path.resolve(__dirname, '../public'), to: 'public' }],
    }),
    new HtmlWebpackPlugin({
      template: Path.resolve(__dirname, '../src/index.html'),
      chunks: ['main'],
    }),
  ].concat(multipleHtmlPlugins),
  resolve: {
    alias: {
      '~': Path.resolve(__dirname, '../src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        type: 'asset',
      },
    ],
  },
};

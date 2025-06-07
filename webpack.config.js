// webpack.config.js
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

// 动态获取所有 TypeScript 文件
const tsFiles = glob.sync('./js-src/**/*.ts');

module.exports = {
    mode: 'development',

    // 多入口配置：包含所有 TypeScript 文件
    entry: './js-src/main.ts',

    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },

    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            'gl-matrix': path.resolve(__dirname, 'lib/gl-matrix'),
        }
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            _: 'lodash'
        }),

        // 自动导入所有模块（可选）
        new webpack.AutomaticPrefetchPlugin()
    ],

    devtool: 'source-map',

    optimization: {
        // 提取公共依赖
        splitChunks: {
            chunks: 'all',
            name: 'common'
        }
    }
};
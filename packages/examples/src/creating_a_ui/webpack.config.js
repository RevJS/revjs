const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const outputPath = path.join(__dirname, 'js');

module.exports = function() {
    return {
        entry: {
            simple_list: './src/creating_a_ui/simple_list/simple_list.tsx'
        },
        output: {
            path: outputPath, 
            filename: '[name].js'
        },
        module: {
            rules: [
                { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ }
            ]
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        performance: {
            hints: false
        },
        optimization: {
            minimizer: [
                new UglifyJSPlugin({
                    sourceMap: true,
                    uglifyOptions: {
                        compress: {
                            inline: false
                        },
                        mangle: {
                            keep_fnames: true
                        }
                    }
                }),
            ]
        },
    }
}

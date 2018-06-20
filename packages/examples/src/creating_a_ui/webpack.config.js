const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const outputPath = path.join(__dirname, 'js');

module.exports = function() {
    return {
        entry: {
            simple_list: './src/creating_a_ui/simple_list/simple_list.tsx',
            custom_list: './src/creating_a_ui/custom_list/custom_list.tsx',
            searchable_list: './src/creating_a_ui/searchable_list/searchable_list.tsx',
            related_data: './src/creating_a_ui/related_data/related_data.tsx',
            detailview: './src/creating_a_ui/detailview/detailview.tsx',
            detailview_allfields: './src/creating_a_ui/detailview_allfields/detailview_allfields.tsx',
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

'use strict';

const webpack                       = require('webpack');
const path                          = require('path');

const SentryWebpackPlugin           = require('@sentry/webpack-plugin');
const TerserPlugin                  = require("terser-webpack-plugin");
const JsonMinimizerPlugin           = require("json-minimizer-webpack-plugin");
const MergeJsonPlugin               = require("merge-json-webpack-plugin");

module.exports = env => {
    return {
        mode            : 'production',
        devtool         : 'hidden-source-map',
        performance     : { hints: false },
        context         : path.resolve(__dirname, 'src'),
        entry           : {
            SCIM                        : './SCIM.js',
            'Worker/SaveParser/Read'    : './SaveParser/ReadWorker.js',
            'Worker/SaveParser/Write'   : './SaveParser/Write.js'
        },

        output          : {
            path            : path.resolve(__dirname, 'build'),
            filename        : './[name]Experimental.js'
        },
        optimization    : {
            minimize        : true,
            minimizer       : [
                new TerserPlugin({test: /\.js(\?.*)?$/i}),
                new JsonMinimizerPlugin({test: /\.json(\?.*)?$/i})
            ]
        },

        plugins: [
            // Merge all detailed models into a single JSON file...
            new MergeJsonPlugin({
                groups: [
                    { pattern: './Models/*/*.json', to: './detailedModels.json' }
                ]
            })
        ]
    };
};
'use strict';

const path                  = require('path');
const TerserPlugin          = require("terser-webpack-plugin");
const JsonMinimizerPlugin   = require("json-minimizer-webpack-plugin");
const MergeJsonPlugin       = require("merge-json-webpack-plugin");
const CopyPlugin            = require("copy-webpack-plugin");

module.exports = {
    mode            : 'production',
    devtool         : 'source-map',
    performance     : { hints: false },
    context         : path.resolve(__dirname, 'src'),
    entry           : './SCIM.js',

    output          : {
        path            : path.resolve(__dirname, 'build'),
        filename        : './SCIM.js'
    },

    optimization    : {
        minimize        : true,
        minimizer       : [
            new TerserPlugin({test: /\.js(\?.*)?$/i}),
            new JsonMinimizerPlugin({test: /\.json(\?.*)?$/i})
        ]
    },

    plugins: [
        /* Merge all detailed models into a single JSON file... */
        new MergeJsonPlugin({
            group: [
                { files: './Models/*.json', to: './detailedModels.json' }
            ]
        }),
        new CopyPlugin({
            patterns: [
                { from: "./PipeFonts/*.json" }
            ]
        })
    ]
};




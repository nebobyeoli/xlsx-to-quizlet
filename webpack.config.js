const webpack = require("webpack");

//const test_secret = process.env.test_secret;

module.exports = {
    entry: "./test-secret.js",
    resolve: {
        extensions: ['.js']
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.test_secret': JSON.stringify(process.env.test_secret)
        })
    ]
}
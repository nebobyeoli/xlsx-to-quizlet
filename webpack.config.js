const webpack = require('webpack');
const dotenv = require('dotenv');
//const test_secret = process.env.test_secret;

module.exports = {
    entry: "./test-secret.js",
    resolve: {
        extensions: ['.js']
    },
    plugins: [
        new webpack.DefinePlugin({
            //'process.env.test_secret': JSON.stringify(process.env.test_secret)
            'process.env': JSON.stringify(dotenv.config().parsed) // it will automatically pick up key values from .env file
        })
    ]
}
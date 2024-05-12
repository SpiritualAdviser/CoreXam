const path = require('path')

module.exports = {
    entry: {
        main: path.resolve(__dirname, './src/load.js'),
    },
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'load.js',
    },

    devServer: {
        static: {
            directory: path.join(__dirname, './devServer'),
        },
        compress: true,
        port: 9000,
    },

}
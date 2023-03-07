const path = require('path');

module.exports = {

    mode: 'development',

    devtool: 'cheap-module-source-map',

    entry: path.join(__dirname, '..', 'src', 'js', 'index'),

    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'LemurPlayer.js',
        library: 'LemurPlayer',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true,
        publicPath: '/'
    },

    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.less'],
        fallback: {
            dgram: false,
            fs: false,
            net: false,
            tls: false
        }
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: path.join(__dirname, '..', 'src'),
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: ['postcss-preset-env']
                            }
                        }
                    },
                    'less-loader'
                ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.art$/,
                loader: 'art-template-loader'
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader',
                options: {
                    limit: 40000
                }
            }
        ]
    },

    devServer: {
        port: 8001,
        static: {
            directory: path.join(__dirname, '..', 'test'),
        },
        open: true
    }

};
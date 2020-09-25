const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');


module.exports = (env, { mode = 'development' }) => {

    const config = {
        context: __dirname,
        cache: true,
        mode,
        stats: {
            warnings: mode !== "production",
            children: false
        },
        entry: {
            "js/index": path.join(__dirname, "clientapp/app.tsx"),
            "sw": path.join(__dirname, "clientapp/service-worker.ts"),
            "js/global": path.join(__dirname, "wwwroot/css/global.scss"),
        },
        output: {
            filename: "[name].js",
            path: path.join(__dirname, "wwwroot")
        },
        resolve: {

            extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss']
        },
        devtool: mode === "production" ? false : 'inline-source-map',

        optimization: {
            mangleWasmImports: mode === "production",
            mergeDuplicateChunks: true,
            minimize: mode === "production"
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx|tsx|ts)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                },
                {
                    test: /\.(scss)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: { outputPath: '../css/', name: '[name].min.css' }
                        },
                        "sass-loader"
                    ]
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                }
            ]
        },
        plugins: [
            new ProgressBarPlugin(),
            new ForkTsCheckerWebpackPlugin()
        ]
    };

    return config;
};
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// Always use the project's Phaser (v4). @poki/phaser-3 nests Phaser 3 and would
// otherwise double the bundle and break the plugin (extends the wrong BasePlugin).
const phaserRoot = path.resolve(__dirname, "node_modules/phaser");
const pokiPhaserPlugin = path.resolve(
    __dirname,
    "node_modules/@poki/phaser-3/lib/index.js"
);

module.exports = {
    entry: {
        main: "./src/index.ts"
    },
    optimization: {
        // Poki's plugin matches scenes via constructor.name — keep class names in prod.
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                },
            }),
        ],
        splitChunks: {
            cacheGroups: {
                phaser: {
                    // Only the root project Phaser, not nested copies under other packages.
                    test: /[\\/]node_modules[\\/]phaser[\\/]/,
                    name: "phaser",
                    chunks: "all",
                },
                phasereditor2d: {
                    test: /[\\/]node_modules[\\/]@phasereditor2d[\\/]/,
                    name: "phasereditor2d",
                    chunks: "all",
                }
            }
        }
    },
    output: {
        path: path.resolve(__dirname, "docs"),
        filename: "[name]-[contenthash].bundle.js",
        assetModuleFilename: "asset-packs/[name]-[hash][ext][query]",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.json/,
                type: "asset/resource",
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            "@esotericsoftware/spine-phaser$": path.resolve(__dirname, "src/vendor/spine-phaser.ts"),
            // Force a single Phaser instance for the whole graph (incl. Poki plugin).
            phaser: phaserRoot,
            "@poki/phaser-3": pokiPhaserPlugin,
        },
    },
    devServer: {
        historyApiFallback: true,
        allowedHosts: 'all',
        static: {
            directory: path.resolve(__dirname, "./docs"),
        },
        open: true,
        hot: true,
        port: 8080,
    },
    plugins: [
        new webpack.ProvidePlugin({
            Phaser: "phaser"
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src/index.html"),
            minify: false
        }),
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: "static",
                    globOptions: {
                        // asset pack files are imported in code as modules
                        ignore: ["**/publicroot", "**/*-pack.json"]
                    }
                }
            ]
        }),
        new webpack.HotModuleReplacementPlugin(),
    ]
};
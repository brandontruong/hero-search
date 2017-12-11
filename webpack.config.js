const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ENV = process.env.NODE_ENV || 'development';

module.exports = {
    entry: {
		'hero-search.bundle': './src/index.tsx'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js'
	},
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
            'react': 'preact-compat',
            'react-dom': 'preact-compat',
        },
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins: ([
		new webpack.NoEmitOnErrorsPlugin(),
		new ExtractTextPlugin('style.css', { allChunks: true }),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(ENV)
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html'
        })
	]).concat(ENV === 'production' ? [
		new webpack.optimize.OccurrenceOrderPlugin()
	] : []),
    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.

    // to exclude the react and react-dom out of the bundle, these below line needs to be uncommented
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // },
    stats: { colors: true },
    devtool: ENV === 'production' ? 'source-map' : 'inline-source-map',
    devServer: {
		port: process.env.PORT || 8282,
		host: '0.0.0.0',
		publicPath: '/',
		contentBase: './dist',
		historyApiFallback: true,
		proxy: [
			// OPTIONAL: proxy configuration:
			{
				path: '/optional-prefix/**',
				target: 'http://target-host.com',
				rewrite: req => { req.url = req.url.replace(/^\/[^\/]+\//, ''); }   // strip first path segment
			}
		]
	}
};
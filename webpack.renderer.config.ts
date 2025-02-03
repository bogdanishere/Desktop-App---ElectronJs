// import type { Configuration } from 'webpack';

// import { rules } from './webpack.rules';
// import { plugins } from './webpack.plugins';

// rules.push({
//   test: /\.css$/,
//   use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
// });

// export const rendererConfig: Configuration = {
//   module: {
//     rules,
//   },
//   plugins,
//   resolve: {
//     extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
//   },
// };

import type { Configuration } from "webpack";
import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

// Adaugă suport pentru fișiere CSS
rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    fallback: {
      fs: false, // 'fs' nu este disponibil în mediul browser
      path: require.resolve("path-browserify"), // folosește path-browserify ca fallback pentru 'path'
    },
  },
};

// Remove the use array and redefine all the given configations below the test key pair
// 1. Replace babel-loader with builtin:swc-loader for better performance.
// 2. Remove Babel options and presets, specifically @babel/preset-typescript.
// 3. Configure jsc.parser with syntax: 'typescript' and tsx: true.
// 4. Maintain transform object with child objects runtime: 'automatic', and set development and refresh flags to !prod.
// 5. set externalHelpers property to true
// 6. Specify browser compatibility targets, such as Chrome >= 48.

module.exports = {
  module: {
    rules: [{
      test: [/\.tsx?$/i],
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-typescript'],
        },
      }, ],
    }, ],
  },
};
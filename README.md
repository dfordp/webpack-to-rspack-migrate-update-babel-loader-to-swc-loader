Using builtin:swc-loader offers better performance compared to the babel-loader and the external swc-loader, as it avoids frequent communication between JavaScript and Rust.

### Before

```ts
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
```

### After

```ts
module.exports = {
  module: {
    rules: [{
      loader: 'builtin:swc-loader',
      options: {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          externalHelpers: true,
          transform: {
            react: {
              runtime: 'automatic',
              development: !prod,
              refresh: !prod,
            },
          },
        },
        env: {
          targets: 'Chrome >= 48',
        },
      },
    }, ],
  },
};
```


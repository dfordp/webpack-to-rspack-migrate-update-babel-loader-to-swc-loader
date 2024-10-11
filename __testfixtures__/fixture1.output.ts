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
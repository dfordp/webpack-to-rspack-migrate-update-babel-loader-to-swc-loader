export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the module.exports assignment
  root.find(j.AssignmentExpression, {
    left: {
      object: { name: 'module' },
      property: { name: 'exports' },
    },
  }).forEach((path) => {
    const moduleExports = path.node.right;

    // Check if moduleExports is a CallExpression (e.g., merge(baseConfig, {...}))
    if (j.CallExpression.check(moduleExports)) {
      const args = moduleExports.arguments;
      const configObject = args.find((arg) =>
        j.ObjectExpression.check(arg),
      );

      if (configObject) {
        transformConfigObject(configObject);
      }
    } else if (j.ObjectExpression.check(moduleExports)) {
      // Directly assigned as an object
      transformConfigObject(moduleExports);
    }
  });

  function transformConfigObject(configObject) {
    const moduleProperty = configObject.properties.find(
      (prop) =>
      j.ObjectProperty.check(prop) &&
      j.Identifier.check(prop.key) &&
      prop.key.name === 'module',
    );

    // Ensure moduleProperty is an ObjectExpression
    if (moduleProperty && j.ObjectExpression.check(moduleProperty.value)) {
      const rulesProperty = moduleProperty.value.properties.find(
        (prop) =>
        j.ObjectProperty.check(prop) &&
        j.Identifier.check(prop.key) &&
        prop.key.name === 'rules',
      );

      // Ensure rulesProperty is an ArrayExpression
      if (rulesProperty && j.ArrayExpression.check(rulesProperty.value)) {
        rulesProperty.value.elements.forEach((rule) => {
          if (j.ObjectExpression.check(rule)) {
            const useProperty = rule.properties.find(
              (prop) =>
              j.ObjectProperty.check(prop) &&
              j.Identifier.check(prop.key) &&
              prop.key.name === 'use',
            );

            if (useProperty) {
              let babelLoader = null;

              // Check if use is an ArrayExpression
              if (j.ArrayExpression.check(useProperty.value)) {
                babelLoader = useProperty.value.elements.find(
                  (el) =>
                  j.ObjectExpression.check(el) &&
                  el.properties.some((prop) => {
                    return (
                      j.ObjectProperty.check(prop) &&
                      j.Identifier.check(prop.key) &&
                      prop.key.name === 'loader' &&
                      j.StringLiteral.check(
                        prop.value,
                      ) &&
                      /^babel-loader(\?.*)?$/.test(
                        prop.value.value,
                      )
                    );
                  }),
                );
              } else if (
                j.ObjectExpression.check(useProperty.value)
              ) {
                // Check if use is an ObjectExpression
                const loaderProp =
                  useProperty.value.properties.find(
                    (prop) =>
                    j.ObjectProperty.check(prop) &&
                    j.Identifier.check(prop.key) &&
                    prop.key.name === 'loader' &&
                    j.StringLiteral.check(prop.value) &&
                    /^babel-loader(\?.*)?$/.test(
                      prop.value.value,
                    ),
                  );
                if (loaderProp) {
                  babelLoader = useProperty.value;
                }
              }

              if (babelLoader) {
                // Retain the test property
                const testProperty = rule.properties.find(
                  (prop) =>
                  j.ObjectProperty.check(prop) &&
                  j.Identifier.check(prop.key) &&
                  prop.key.name === 'test',
                );

                // Retain the exclude property if it exists
                const excludeProperty = rule.properties.find(
                  (prop) =>
                  j.ObjectProperty.check(prop) &&
                  j.Identifier.check(prop.key) &&
                  prop.key.name === 'exclude',
                );

                // Modify the options object
                const optionsProperty =
                  babelLoader.properties.find(
                    (prop) =>
                    j.ObjectProperty.check(prop) &&
                    j.Identifier.check(prop.key) &&
                    prop.key.name === 'options',
                  );

                if (optionsProperty) {
                  const optionsObject = optionsProperty.value;
                  if (
                    j.ObjectExpression.check(optionsObject)
                  ) {
                    // Remove @babel/preset-typescript from presets
                    const presetsProperty =
                      optionsObject.properties.find(
                        (prop) =>
                        j.ObjectProperty.check(
                          prop,
                        ) &&
                        j.Identifier.check(
                          prop.key,
                        ) &&
                        prop.key.name === 'presets',
                      );

                    if (
                      presetsProperty &&
                      j.ArrayExpression.check(
                        presetsProperty.value,
                      )
                    ) {
                      presetsProperty.value.elements =
                        presetsProperty.value.elements.filter(
                          (el) =>
                          !(
                            j.StringLiteral.check(
                              el,
                            ) &&
                            el.value ===
                            '@babel/preset-typescript'
                          ),
                        );
                    }

                    // Remove plugins if empty
                    const pluginsProperty =
                      optionsObject.properties.find(
                        (prop) =>
                        j.ObjectProperty.check(
                          prop,
                        ) &&
                        j.Identifier.check(
                          prop.key,
                        ) &&
                        prop.key.name === 'plugins',
                      );

                    if (
                      pluginsProperty &&
                      j.ArrayExpression.check(
                        pluginsProperty.value,
                      )
                    ) {
                      if (
                        pluginsProperty.value.elements
                        .length === 0
                      ) {
                        optionsObject.properties =
                          optionsObject.properties.filter(
                            (prop) =>
                            prop !==
                            pluginsProperty,
                          );
                      }
                    }
                  }
                } else {
                  // If optionsProperty is missing, create a new one
                  babelLoader.properties.push(
                    j.objectProperty(
                      j.identifier('options'),
                      j.objectExpression([]),
                    ),
                  );
                }

                // Replace the rule with the new configuration
                rule.properties = [
                  testProperty, // Retain the test property
                  excludeProperty, // Retain the exclude property if it exists
                  j.objectProperty(
                    j.identifier('loader'),
                    j.stringLiteral('builtin:swc-loader'),
                  ),
                  j.objectProperty(
                    j.identifier('options'),
                    j.objectExpression([
                      ...(optionsProperty ?
                        optionsObject.properties.filter(
                          (prop) =>
                          !(
                            j.Identifier.check(
                              prop.key,
                            ) &&
                            prop.key.name ===
                            'presets'
                          ),
                        ) :
                        []),
                      j.objectProperty(
                        j.identifier('jsc'),
                        j.objectExpression([
                          j.objectProperty(
                            j.identifier('parser'),
                            j.objectExpression([
                              j.objectProperty(
                                j.identifier(
                                  'syntax',
                                ),
                                j.stringLiteral(
                                  'typescript',
                                ),
                              ),
                              j.objectProperty(
                                j.identifier(
                                  'tsx',
                                ),
                                j.booleanLiteral(
                                  true,
                                ),
                              ),
                            ]),
                          ),
                          j.objectProperty(
                            j.identifier(
                              'externalHelpers',
                            ),
                            j.booleanLiteral(true),
                          ),
                          j.objectProperty(
                            j.identifier(
                              'transform',
                            ),
                            j.objectExpression([
                              j.objectProperty(
                                j.identifier(
                                  'react',
                                ),
                                j.objectExpression(
                                  [
                                    j.objectProperty(
                                      j.identifier(
                                        'runtime',
                                      ),
                                      j.stringLiteral(
                                        'automatic',
                                      ),
                                    ),
                                    j.objectProperty(
                                      j.identifier(
                                        'development',
                                      ),
                                      j.unaryExpression(
                                        '!',
                                        j.identifier(
                                          'prod',
                                        ),
                                      ),
                                    ),
                                    j.objectProperty(
                                      j.identifier(
                                        'refresh',
                                      ),
                                      j.unaryExpression(
                                        '!',
                                        j.identifier(
                                          'prod',
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ]),
                          ),
                        ]),
                      ),
                      j.objectProperty(
                        j.identifier('env'),
                        j.objectExpression([
                          j.objectProperty(
                            j.identifier('targets'),
                            j.stringLiteral(
                              'Chrome >= 48',
                            ),
                          ),
                        ]),
                      ),
                    ]),
                  ),
                ].filter(Boolean); // Filter out any undefined properties
                dirtyFlag = true;
              }
            }
          }
        });
      }
    }
  }

  return dirtyFlag ? root.toSource() : undefined;
}

export const parser = 'tsx';
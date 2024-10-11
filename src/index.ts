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

    // Ensure moduleExports is an ObjectExpression
    if (j.ObjectExpression.check(moduleExports)) {
      const moduleProperty = moduleExports.properties.find(
        (prop) =>
        j.ObjectProperty.check(prop) &&
        j.Identifier.check(prop.key) &&
        prop.key.name === 'module',
      );

      // Ensure moduleProperty is an ObjectExpression
      if (
        moduleProperty &&
        j.ObjectExpression.check(moduleProperty.value)
      ) {
        const rulesProperty = moduleProperty.value.properties.find(
          (prop) =>
          j.ObjectProperty.check(prop) &&
          j.Identifier.check(prop.key) &&
          prop.key.name === 'rules',
        );

        // Ensure rulesProperty is an ArrayExpression
        if (
          rulesProperty &&
          j.ArrayExpression.check(rulesProperty.value)
        ) {
          rulesProperty.value.elements.forEach((rule) => {
            if (j.ObjectExpression.check(rule)) {
              const useProperty = rule.properties.find(
                (prop) =>
                j.ObjectProperty.check(prop) &&
                j.Identifier.check(prop.key) &&
                prop.key.name === 'use',
              );

              // Ensure useProperty is an ArrayExpression
              if (
                useProperty &&
                j.ArrayExpression.check(useProperty.value)
              ) {
                const babelLoader =
                  useProperty.value.elements.find(
                    (el) =>
                    j.ObjectExpression.check(el) &&
                    el.properties.some(
                      (prop) =>
                      j.ObjectProperty.check(
                        prop,
                      ) &&
                      j.Identifier.check(
                        prop.key,
                      ) &&
                      prop.key.name ===
                      'loader' &&
                      j.StringLiteral.check(
                        prop.value,
                      ) &&
                      prop.value.value ===
                      'babel-loader',
                    ),
                  );

                if (babelLoader) {
                  // Retain the test property
                  const testProperty = rule.properties.find(
                    (prop) =>
                    j.ObjectProperty.check(prop) &&
                    j.Identifier.check(prop.key) &&
                    prop.key.name === 'test',
                  );

                  // Replace the rule with the new configuration
                  rule.properties = [
                    testProperty, // Retain the test property
                    j.objectProperty(
                      j.identifier('loader'),
                      j.stringLiteral(
                        'builtin:swc-loader',
                      ),
                    ),
                    j.objectProperty(
                      j.identifier('options'),
                      j.objectExpression([
                        j.objectProperty(
                          j.identifier('jsc'),
                          j.objectExpression([
                            j.objectProperty(
                              j.identifier(
                                'parser',
                              ),
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
                              j.booleanLiteral(
                                true,
                              ),
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
                              j.identifier(
                                'targets',
                              ),
                              j.stringLiteral(
                                'Chrome >= 48',
                              ),
                            ),
                          ]),
                        ),
                      ]),
                    ),
                  ];
                  dirtyFlag = true;
                }
              }
            }
          });
        }
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}

export const parser = 'tsx';
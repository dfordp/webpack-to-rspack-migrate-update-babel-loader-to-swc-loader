/*! @license
The MIT License (MIT)

Copyright (c) 2024 dfordp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";Object.defineProperty(exports,"__esModule",{value:true});function _export(target,all){for(var name in all)Object.defineProperty(target,name,{enumerable:true,get:all[name]})}_export(exports,{default:function(){return transform},parser:function(){return parser}});function transform(file,api,options){const j=api.jscodeshift;const root=j(file.source);let dirtyFlag=false;root.find(j.AssignmentExpression,{left:{object:{name:"module"},property:{name:"exports"}}}).forEach(path=>{const moduleExports=path.node.right;if(j.ObjectExpression.check(moduleExports)){const moduleProperty=moduleExports.properties.find(prop=>j.ObjectProperty.check(prop)&&j.Identifier.check(prop.key)&&prop.key.name==="module");if(moduleProperty&&j.ObjectExpression.check(moduleProperty.value)){const rulesProperty=moduleProperty.value.properties.find(prop=>j.ObjectProperty.check(prop)&&j.Identifier.check(prop.key)&&prop.key.name==="rules");if(rulesProperty&&j.ArrayExpression.check(rulesProperty.value)){rulesProperty.value.elements.forEach(rule=>{if(j.ObjectExpression.check(rule)){const useProperty=rule.properties.find(prop=>j.ObjectProperty.check(prop)&&j.Identifier.check(prop.key)&&prop.key.name==="use");if(useProperty&&j.ArrayExpression.check(useProperty.value)){const babelLoader=useProperty.value.elements.find(el=>j.ObjectExpression.check(el)&&el.properties.some(prop=>j.ObjectProperty.check(prop)&&j.Identifier.check(prop.key)&&prop.key.name==="loader"&&j.StringLiteral.check(prop.value)&&prop.value.value==="babel-loader"));if(babelLoader){const testProperty=rule.properties.find(prop=>j.ObjectProperty.check(prop)&&j.Identifier.check(prop.key)&&prop.key.name==="test");rule.properties=[testProperty,j.objectProperty(j.identifier("loader"),j.stringLiteral("builtin:swc-loader")),j.objectProperty(j.identifier("options"),j.objectExpression([j.objectProperty(j.identifier("jsc"),j.objectExpression([j.objectProperty(j.identifier("parser"),j.objectExpression([j.objectProperty(j.identifier("syntax"),j.stringLiteral("typescript")),j.objectProperty(j.identifier("tsx"),j.booleanLiteral(true))])),j.objectProperty(j.identifier("externalHelpers"),j.booleanLiteral(true)),j.objectProperty(j.identifier("transform"),j.objectExpression([j.objectProperty(j.identifier("react"),j.objectExpression([j.objectProperty(j.identifier("runtime"),j.stringLiteral("automatic")),j.objectProperty(j.identifier("development"),j.unaryExpression("!",j.identifier("prod"))),j.objectProperty(j.identifier("refresh"),j.unaryExpression("!",j.identifier("prod")))]))]))])),j.objectProperty(j.identifier("env"),j.objectExpression([j.objectProperty(j.identifier("targets"),j.stringLiteral("Chrome >= 48"))]))]))];dirtyFlag=true}}}})}}}});return dirtyFlag?root.toSource():undefined}const parser="tsx";
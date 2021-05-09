const fs = require('fs');
const path = require('path');
const Module = require('module');
const chai = require('chai');
const { testSchema } = require('./build/validation/__tests__/harness.js');
const { printSchema } = require('./build/utilities/index.js');

const schemas = [];
const rules = [];
const names = [];
let tests = [];
function findOrPush(schema) {
    for (let i = 0; i < schemas.length; i++) {
        if (schemas[i].toLowerCase() === schema.toLowerCase()) {
            return i;
        }
    }
    return schemas.push(schema) - 1;
}

function capitalize(str) {
    return str.split(' ').map(e => e.charAt(0).toUpperCase() + e.slice(1)).join('');
}

const harness = {
    expectValidationErrorsWithSchema(schema, validationRule, query) {
        return {
            to: {
                deep: {
                    equal(obj) {
                        tests.push({
                            name: names.pop(),
                            rule: rules[0],
                            schema: schema ? findOrPush(printSchema(schema)) : 0,
                            query: query,
                            errors: obj,
                        });
                    }
                },
                have: { nested: { property() { } } }
            }
        }
    },
    expectValidationErrors(validationRule, query) {
        return harness.expectValidationErrorsWithSchema(testSchema, validationRule, query);
    },
    expectSDLValidationErrors(schema, validationRule, sdlStr) {
        return {
            to: {
                deep: {
                    equal(obj) {
                        tests.push({
                            name: names.pop(),
                            rule: rules[0],
                            schema: schema ? findOrPush(printSchema(schema)) : 0,
                            query: sdlStr,
                            errors: obj,
                        });
                    }
                },
                have: { nested: { property() { } } }
            }
        }
    },
    testSchema,
};

const fakeModules = {
    'mocha': {
        describe(rule, f) {
            rules.push(capitalize(rule.replace('Validate: ', '').replace(',', '')));
            f();
            rules.pop();
        },
        it(name, f) {
            names.push(capitalize(name.replace(',', '')));
            f();
        },
    },
    './harness': harness,
    'chai': chai,
};

const originalLoader = Module._load;
Module._load = function (request, parent, isMain) {
    return fakeModules[request] || originalLoader(request, parent, isMain);
};

const outDir = '../testdata';

if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir);

fs.readdirSync("./build/validation/__tests__").forEach(file => {
    if (!file.endsWith('Rule-test.js')) {
        return
    }
    require('./build/validation/__tests__/' + file);
    fs.writeFileSync(path.join(outDir, file.replace('-test.js', '.json')), JSON.stringify({ tests }, null, 2));
    tests = [];
});

fs.writeFileSync(path.join(outDir, 'schemas.json'), JSON.stringify({ schemas }, null, 2));

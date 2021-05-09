const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const buildDir = './build';
const srcDir = './graphql-js/src';

function readDirRecursive(dir) {
    // console.log(path.join(srcDir, dir));
    fs.readdirSync(path.join(srcDir, dir)).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(path.join(srcDir, filePath)).isDirectory()) {
            fs.mkdirSync(path.join(buildDir, filePath), { recursive: true });
            readDirRecursive(filePath);
            return;
        }
        if (!file.endsWith('.js')) {
            return;
        }
        // console.log(path.join(srcDir, filePath));
        fs.writeFileSync(path.join(buildDir, filePath), compile(path.join(srcDir, filePath)));
        // console.log(path.join(buildDir, filePath));
    });
}

function compile(file) {
    const { code } = babel.transformFileSync(file, {
        babelrc: false,
        configFile: './.babelrc.json',
    });
    return code + '\n';
}

fs.rmSync(buildDir, { recursive: true, force: true });
fs.mkdirSync(buildDir);

readDirRecursive('');

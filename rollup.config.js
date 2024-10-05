const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  input: 'src/sparef.ts',
  output: {
    file: 'dist/sparef.umd.js',
    format: 'umd',
    name: 'Sparef',
    sourcemap: true
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript()
  ]
};
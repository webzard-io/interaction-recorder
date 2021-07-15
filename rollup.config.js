import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import external from 'rollup-plugin-peer-deps-external';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.DEVELOPMENT;
module.exports = [
  {
    input: 'src/index.ts',
    output: {
      file: './build/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      commonjs(),
      external(),
      resolve({ browser: true, preferBuiltins: true }),
      typescript(),
      production && terser(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      name: 'recorder',
      file: './build/index.browser.js',
      format: 'iife',
      sourcemap: true,
    },
    plugins: [
      commonjs(),
      external(),
      resolve({ browser: true, preferBuiltins: true }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      typescript(),
    ],
  },
];

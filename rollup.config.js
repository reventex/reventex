import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

import packageJson from './package.json';

const isProduction = process.env.NODE_ENV === 'production';
const NODE_ENV = isProduction ? 'production' : 'development';

const external = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {})
];

export default [
  {
    input: 'src/client/index.ts',
    output: [
      {
        file: 'client.js',
        format: 'cjs',
        sourcemap: true
      }
    ],
    plugins: [
      resolve({}),
      commonjs({}),
      typescript(),
      replace({
        values: {
          'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
        },
        preventAssignment: true
      }),
      ...(isProduction ? [terser({ toplevel: true})] : [])
    ],
    external
  },
  {
    input: 'src/client/index.ts',
    output: [
      {
        file: 'client.mjs',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      resolve({}),
      commonjs({}),
      typescript(),
      replace({
        values: {
          'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
        },
        preventAssignment: true
      }),
      ...(isProduction ? [terser({module:true})] : [])
    ],
    external
  },
  {
    input: 'src/server/index.ts',
    output: [
      {
        file: 'server.js',
        format: 'cjs',
        sourcemap: true
      }
    ],
    plugins: [
      resolve({}),
      commonjs({}),
      typescript(),
      replace({
        values: {
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
        },
        preventAssignment: true
      }),
      ...(isProduction ? [terser({toplevel:true})] : [])
    ],
    external
  },
  {
    input: 'src/server/index.ts',
    output: [
      {
        file: 'server.mjs',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      resolve({}),
      commonjs({}),
      typescript(),
      replace({
        values: {
          'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
        },
        preventAssignment: true
      }),
      ...(isProduction ? [terser({module:true})] : [])
    ],
    external
  }
];


import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import optimizeJs from 'rollup-plugin-optimize-js';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist/',
    format: 'esm',
    sourcemap: true,
    preserveModules: true,
  },
  external: p => /^three/.test(p),
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfig: 'tsconfig.json',
    }),
    uglify({
      compress: {
        negate_iife: false, // not required, similar optimization
        passes: 2,
      },
      output: {
        beautify: false,
      },
    }),
    optimizeJs(), // occurs after uglify
  ],
};

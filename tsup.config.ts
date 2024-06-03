import { defineConfig } from 'tsup';
/**
 * 由于tsup使用rollup-plugin-dts去生成dts文件，且该插件和配置的tsconfig.json中文件composite属性为true时会有冲突，从而导致报错。
 * 详情请参考：https://github.com/egoist/tsup/issues/571
 */
export default defineConfig({
  entry: ['src/*.ts'], //入口文件
  splitting: true, //代码分割
  cjsInterop: true,
  shims: true,
  clean: true, //每次都清除dist目录
  dts: true, // 生成 .d.ts 文件
  format: ['cjs', 'esm'], // 输出格式
  target: 'node16' // 目标环境
});

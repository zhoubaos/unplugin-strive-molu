import { type UnpluginFactory, createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import { type Options } from './core/types';
import { transformStyle } from './core/style';

export type { Options };

const defineOptions: Options = {
  include: ['**/*.js', '**/*.ts', '**/*.vue'],
  exclude: ['node_modules/**'],
  lib: 'strive-molu',
  prefix: 'Sm',
  useCss: true,
  ignoreComponents: []
};

export const unplginStriveMolu: UnpluginFactory<Partial<Options> | undefined> = (userOptions = {}) => {
  const options = Object.assign(defineOptions, userOptions);
  const filter = createFilter(options.include, options.exclude);
  return {
    name: 'unplugin-strive-molu',
    enforce: 'post', // 该属性在rollup无效，用于指定创建的顺序。详情：https://cn.vitejs.dev/guide/api-plugin.html#plugin-ordering
    // webpack适配的钩子函数，
    transformInclude(id) {
      return filter(id);
    },
    transform(code, id) {
      return transformStyle(code, options);
    }
  };
};

export default createUnplugin(unplginStriveMolu);

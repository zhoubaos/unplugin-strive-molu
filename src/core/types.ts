import { type FilterPattern } from '@rollup/pluginutils';

// 创建的参数类型
export type Options = {
  /**
   * 值为RegExp或者glob，去匹配符合规则的文件
   */
  include: FilterPattern;
  /**
   * 值为RegExp或者glob，去排除符合规则的文件
   */
  exclude: FilterPattern;
  /**
   * 导入的包名
   * @default strive-molu
   */
  lib: string;
  /**
   * 导入模块的前缀
   * @default Sm
   */
  prefix: string;
  /**
   * 过滤的组件名称
   * @example ['Button'，'SmButton']
   */
  ignoreComponents: string[];
  /**
   * 导入的样式是否使用css，如果为否则导入less文件
   * @default true
   */
  useCss: boolean;
};

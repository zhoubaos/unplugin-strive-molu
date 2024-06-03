import { type ImportSpecifier, type ExportSpecifier, init, parse } from 'es-module-lexer';
import { type Options } from './types';
import type { TransformResult } from 'unplugin';
import MagicString from 'magic-string';
import { pascalCase } from 'change-case';
import consola from 'consola';
import chalk from 'chalk';

// 匹配多行注释正则
const multilineCommentsRE = /\/\*\s(.|[\n\r])*?\*\//gm;
// 匹配单行注释正则
const singlelineCommentsRE = /\/\/\s.*/g;
// 清除代码中的注释
function stripeComments(code: string) {
  return code.replaceAll(multilineCommentsRE, '').replaceAll(singlelineCommentsRE, '');
}
// 判断是否是忽略的组件
function isIgonreComponent(component: string, ignoreComponents: string[], prefix = '') {
  return ignoreComponents.some((c) => c === component || c === pascalCase(prefix + component));
}
const hyphenateRE = /\B([A-Z])/g;
/**
 * @example
 * hyphenate('ButtonGroup') => 'button-group'
 */
const hyphenate = (str: string) => str.replaceAll(hyphenateRE, '-$1').toLowerCase();
/**
 *
 * @param specifier 导入语句位置参数
 * @param source
 * @param options
 */
export const transformImportStyle = (
  specifier: ImportSpecifier,
  source: string,
  options: {
    prefix: string;
    lib: string;
    useCss: boolean;
    ignoreComponents: string[];
  }
) => {
  const { prefix, lib, useCss, ignoreComponents } = options;
  const statement = stripeComments(source.slice(specifier.ss, specifier.se));
  const exportVariables = transformImportVar(statement);

  const styleImports: string[] = [];
  // n 导入的模块名称，如：SmButton
  exportVariables.forEach(({ n }) => {
    // 导入的模块必须是prefix开头，且不在排除组件之内
    if (n.startsWith(prefix) && !isIgonreComponent(n, ignoreComponents, prefix)) {
      const comFloderName = n.slice(prefix.length);
      styleImports.push(`import '${lib}/es/components/${hyphenate(comFloderName)}/style/${useCss ? 'css' : 'index'}';`);
    }
  });
  return styleImports.join('\n');
};
/**
 * @description 获取导入语句导入的变量的解析信息
 */
export const transformImportVar = (importStr: string) => {
  if (!importStr) return [];
  // 把导入语句中的import替换为export，并去掉as后面的变量名
  const exportStr = importStr.replace('import', 'export').replace(/\s+as\s+\w+,?/g, ',');
  let importVariables: readonly ExportSpecifier[] = [];
  try {
    importVariables = parse(exportStr)[1];
  } catch (error) {
    consola.error(chalk.red('es-module-lexer解析错误：', error));
  }

  return importVariables;
};

/**
 * @description 给源码中
 * @param source
 * @param options
 * @returns
 */
export const transformStyle = async (source: string, options: Options): Promise<TransformResult> => {
  const { lib, prefix, ignoreComponents, useCss } = options;
  if (!source) return;
  try {
    await init;

    // 过滤符合规则的导入语句
    const filterSpecifier = parse(source)[0].filter(({ n }) => {
      return n === lib || n == `${lib}/es/components` || n == `${lib}/lib/components`;
    });
    if (!filterSpecifier.length) return;

    // 添加导入样式文件路径
    const importStyles = filterSpecifier
      .map((s) => transformImportStyle(s, source, { prefix, lib, useCss, ignoreComponents }))
      .filter((s) => s)
      .join('\n');

    const lastFilSpecifier = filterSpecifier.at(-1) as ImportSpecifier;

    const s = new MagicString(source);
    // 在最后一个导入语句的后面插入样式导入语句
    s.appendLeft(lastFilSpecifier?.se + 1, `\n${importStyles}\n`);

    return {
      code: s.toString(),
      map: s.generateMap({ hires: true, includeContent: true })
    };
  } catch (error) {
    console.error(error);
  }
};

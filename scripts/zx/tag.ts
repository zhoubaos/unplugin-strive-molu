#!/usr/bin/env zx

import { $, question, cd, path, argv, fs, os, chalk, usePowerShell } from 'zx';
import consola from 'consola';

// 让powerShell可以兼容运行该脚本
if (os.platform() === 'win32') {
  usePowerShell();
}
/**
 * @desc 本地添加git tag标签，并推送到远程
 */
void (async function () {
  // 当前分支
  const curBranchName = (await $`git rev-parse --abbrev-ref HEAD`).stdout.trim();
  if (!['main', 'master'].includes(curBranchName)) {
    exitWithError('当前不是main或master分支');
  }

  // 获取本地当前所有的标签
  const tagList = (await $`git tag`).stdout.trim().split('\n');

  // 标签名称
  const tagName = await question('请输入标签名（eg：0.0.1 | 0.0.1-beta | 0.0.1-beta.1）：');
  /**
   * @example
   * 0.0.1 | 0.0.1-beta | 0.0.1-beta.1
   */
  const tagNameReg = /^\d+\.\d+\.\d+(-\w+(\.\d+)?)?$/;
  if (!tagNameReg.test(tagName)) {
    exitWithError('标签不满足规则');
  } else if (tagList.includes(tagName)) {
    exitWithError('标签已经存在');
  }

  // 标签关联hash值
  const tagHash = await question(`标签关联提交的SHA值(${chalk.gray('非必须，默认最后一次提交')})：`);
  if (tagHash.length) {
    gitHashIsExists(tagHash);
  }

  const tagRemark = await question(`标签备注信息(${chalk.gray('非必须')})：`);

  const tagStrategy: Record<string, any[]> = {
    t: [tagName], //只创建标签
    th: [tagName, tagHash], //创建标签，关联hash
    tr: ['-a', tagName, '-m', tagRemark], //创建标签，添加备注
    thr: ['-a', tagName, '-m', tagRemark, tagHash] //创建标签，关联hash，添加备注
  };

  const tagStrategyJudge: Record<string, () => boolean> = {
    t: () => !tagHash.length && !tagRemark.length,
    th: () => !!tagHash.length && !tagRemark.length,
    tr: () => !tagHash.length && !!tagRemark.length,
    thr: () => !!tagHash.length && !!tagRemark.length
  };

  for (const key in tagStrategyJudge) {
    if (tagStrategyJudge[key]()) {
      const tagCommand = tagStrategy[key];
      // warn：$函数后不能直接跟 $ 符号
      await $`git tag ${tagCommand}`;
      await $`git push origin ${tagName}`;
      consola.success('本地和远程标签添加成功！');
      break;
    }
  }

  // 判断输入的git hash值是否存在
  async function gitHashIsExists(hash: string) {
    try {
      await $`git rev-parse ${hash}`;
    } catch (error) {
      exitWithError(`hash值错误，请使用 ${chalk.yellow('git log --oneline')} 命令查看`);
    }
  }
})();

// 处理错误公共函数
function exitWithError(errorMsg: unknown) {
  consola.error(chalk.red(errorMsg));
  process.exit(1);
}

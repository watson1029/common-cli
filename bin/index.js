#! /usr/bin/env node
// 我们以下的所有console.log都是为了方便验证我们的操作是否成功，脚手架搭建成功后大家可以根据自己的需求进行删除
console.log('start common-cli');

import chalk from 'chalk'; // 命令行美化工具
import ora from 'ora'; // 命令行 loading 效果
import inquirer from 'inquirer'; // 命令行交互工具
// import fs from 'fs-extra'; // 传统fs复制文件目录需要加很多判断比较麻烦,fs-extra解决了这个问题
// import path from 'path'; // 命令行交互工具
import { program } from 'commander'; // 引入commander
import download from 'download-git-repo';
import figlet from 'figlet';

// 定义 create 命令
program
  .command('create') // 配置命令的名字
  .alias('init') // 命令的别名
  .description('网络中心通用脚手架：创建一个项目') // 命令对应的描述
  .option('-f, --force', '如果文件存在就强行覆盖')
  .option('-l, --local-path <path>', '从本地下载模板') // 因为我们目前没有git仓库去储存，所以先通过本地来拉取模板
  .action(async (option1, option2) => {
    /**
     * 这里 action 参数的数量需要和我们定义的option数量一致
     * 比如我们现在定义了 -f 和 -l 两个 option，那我们就需要填写 option1 和 option2 两个参数
     * 假如只填写一个参数的话，执行common-cli create my-project -l 时，就会报错error: unknown option '-l'
     * 执行 common-cli create test -l D:\self\important\my-cli\templates\template-one
     * option1的内容为 { localPath: 'D:\\self\\important\\my-cli\\templates\\template-one' }
     */
    // 取 process.argv[3] 为项目文件夹名称，不清楚为什么的看一下下面的program.parse()的注释内容
    const projectName = process.argv[3];
    
    try {
      // 利用inquirer与用户进行交互
      let { choose } = await inquirer.prompt([
        {
          name: 'choose', // 获取选择后的结果
          type: 'list',
          message: '请选择一个模板创建项目',
          choices: ['fips-template', 'app-template'], // 模板选项列表
        },
      ]);
      const syncTemplate = ora('同步模板中....');
      syncTemplate.start();
      // 复制模板到目标目录
      /**
       * 解释一下https://github.com:bingmada/my-cli#master 这个怎么写
       * 我的git clone地址为https://github.com/bingmada/my-cli.git
       * https://github.com + : + bingmada/my-cli + # + 分支名称 
       */
      download(
        //https://github.com:bingmada/my-cli#master
        'https://github.com:watson1029/common-cli#main',
        `./${projectName}`,
        {
          map: (file) => {
            file.path = file.path.replace(`template\\${choose}`, '');
            return file;
          },
          filter: (file) => {
            return file.path.indexOf(`template\\${choose}`) != -1;
          },
        },
        function (err) {
          if (err) {
            console.error(err);
            return;
          }
          syncTemplate.succeed();
          console.log(
            chalk.green(
              chalk.blue.underline.bold(projectName) + ' 项目创建成功!'
            )
          );
          figlet('W a t s o n    C L I', function(err, data) {
            if (err) {
              console.log("Something went wrong...");
              console.dir(err);
              return;
            }
            console.log(data);
          });
        }
      );
    } catch (err) {
      console.error(err);
    }
  });

/**
 * 处理用户执行时输入的参数,默认值是process.argv
 * process.argv 是 nodejs 提供的属性
 * 比如我们执行 my-cli create my-project 命令时，process.argv 的值是下面这样一个数组:
 * ['D:\\nvm-noinstall\\v16.17.0\\node.exe', 'D:\\nvm-noinstall\\v16.17.0\\node_modules\\my-cli\\bin\\index.js', 'create',  'test']
 * 以下这行代码也可以写为 program.parse(process.argv);
 */
program.parse();
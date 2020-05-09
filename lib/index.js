const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const outputList = require('../output');
// Template settings.
const dist = process.env.DIST || 'dist';
const templateRoot = process.env.TEMPLATE_ROOT || 'templates';
const templateExt = process.env.TEMPLATE_EXTENSION || '.ejs';

function _compileTpl(templateName, data) {
  const filename = path.isAbsolute(templateName) && path.extname(templateName) === templateExt ?
    templateName : path.join(__dirname, '..', templateRoot, templateName + '.ejs');
  const src = fs.readFileSync(templateName, 'utf-8');
  const template = ejs.compile(src, { rmWhitespace: false });
  const result = template(data);
  return result;
}

function compileTpl(file, data) {
  if (!fs.existsSync(file)) {
    throw new Error('模板不存在');
  }

  const src = fs.readFileSync(file, 'utf-8');
  const template = ejs.compile(src, { rmWhitespace: false });
  return template(data);
}

/**
 * 获取模板方法
 * @param {string} file 
 */
function getTemplateF(file) {
  if (!fs.existsSync(file)) {
    throw new Error('模板不存在');
  }

  const src = fs.readFileSync(file, 'utf-8');
  return ejs.compile(src, { rmWhitespace: false });
}

/**
 * 保存内容到指定文件 
 * @param {String} file name full path
 * @param {String} content to be saved.
 */
function save2File(filename, content) {
  const dirname = path.dirname(filename);
  if (!fs.existsSync(dirname)) {
    mkdirp.sync(dirname);
  }

  fs.writeFileSync(filename, content, 'utf-8');
  console.log(chalk.green(`${filename} saved on success.`));
  return filename;
}

/**
 * 通过模板的位置得到编译后文件的保存位置 
 * @param {String} file full path 
 * @param {String} distRoot full path or a single word.
 * @param {String} templateRoot full path
 */
function getTemplateDistP(file, distRoot, templateRoot) {
  let _file = file.replace(new RegExp(templateExt + '$'), '');
  const relativePath = path.relative(templateRoot, _file);
  if (!path.isAbsolute(distRoot)) {
    return _file.replace(/templates/, distRoot);
  } else {
    return path.join(distRoot, relativePath);
  }
}

/**
 * 得到编译后文件的保存位置 
 * @param {String} file full path 
 * @param {String} distRoot full path or a single word.
 */
function getOutputPath(file, distRoot) {
  let _file = file.replace(new RegExp(templateExt + '$'), '');
  let middlePath = '/.temp/'+_file;
  switch(_file){
    case 'view.js':
      middlePath = '/src/pages/'+process.env.servicePackageUpperFirst+'/'+process.env.entity+'/'+process.env.entity+'View.js'
    break;
    case 'list.js':
      middlePath = '/src/pages/'+process.env.servicePackageUpperFirst+'/'+process.env.entity+'/'+process.env.entity+'.js'
    break;
    case 'edit.js':
      middlePath = '/src/pages/'+process.env.servicePackageUpperFirst+'/'+process.env.entity+'/'+process.env.entity+'Edit.js'
    break;
    case 'add.js':
      middlePath = '/src/pages/'+process.env.servicePackageUpperFirst+'/'+process.env.entity+'/'+process.env.entity+'Add.js'
    break;
    case 'services.js':
      middlePath = '/src/services/'+process.env.entityPath+'.js'
    break
    case 'model.js':
      middlePath = '/src/models/'+process.env.entityPath+'.js'
    break
    case 'action.js':
      middlePath = '/src/actions/'+process.env.entityPath+'.js'
    break
  }
  return path.join(distRoot, middlePath);
}

/**
 * 获取编译生成的文件的保存路径，根据相对于模板的路径
 * @param {String} file 
 * @param {String} realName word
 * @param {String} dist word
 * @param {String} templateRoot full path
 */
function getForLoopTDP(file, realName, dist, templateRoot) {
  const dirname = path.dirname(getTemplateDistP(file, dist, templateRoot));
  return path.join(dirname, realName);
}

/**
 * 复制非模板文件到相应路径
 * @param {String} file path
 * @param {String} dist word
 * @param {String} templateRoot full path
 */
function copyStatic (file, dist, templateRoot) {
  const toPath = getTemplateDistP(file, dist, templateRoot);
  const dirname = path.dirname(toPath);
  if (!fs.existsSync(dirname)) {
    mkdirp.sync(dirname);
  }

  fs.copyFileSync(file, toPath);
  return toPath;
}

// Compile and save file.
const handleTpl = function (template, context) {
  const templatePath = path.join(__dirname, '..', template);
  const output = compileTpl(templatePath, context);
  let outputPath = path.join(__dirname, '..', dist, template.slice(templateRoot.length)).slice(0, templateExt.length * -1);
  save2File(outputPath, output);
}

module.exports = {
  copyStatic,
  handleTpl,
  compileTpl,
  save2File,
  getTemplateF,
  getTemplateDistP,
  getForLoopTDP,
  getOutputPath
}

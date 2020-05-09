const fs = require('fs');
const path = require('path');
const walker = require('walker');
const lib = require('./lib/');
const database = require('./lib/database');
const fileTypes = require('./lib/fileTypes');
const _ = require('lodash');



/**
 * Inquirer which database to use.
 */

/**
 * 生成 view 文件。 
 * @param {String} file 
 * @param {String} dist 
 * @param {String} database name 
 * @param {Array} tables 
 */
const generateViews = function (file, dist, dbName, table, templateRoot) {
  if (!fs.existsSync(file)) {
    return new Error('文件不存在')
  }

  const template = lib.getTemplateF(file);
    

    const realName = process.env.includeTables + path.extname(fileTypes.view);
    const _path = lib.getForLoopTDP(file, realName, dist, templateRoot);

    let context = {}
    context._ = _;

    context.model = process.env.includeTables;
    context.fields = table;
    const content = template(context);
    lib.save2File(_path, content);


}

/**
 * 生成 routes 文件
 * @param {String} file 
 * @param {Array} tables 
 */
const generateRoutes = function (file, table) {
  if (!fs.existsSync(file)) {
    return new Error('文件不存在')
  }
  const dist = process.env.packageWebDir;

  const template = lib.getTemplateF(file);

  let context = {}
  context._ = _;
  context.table = table;
  const content = template(context);
  const _path = lib.getOutputPath(path.basename(file), dist)
  lib.save2File(_path, content);
}

/**
 * 利用默认上下文，生成自身编译文件
 * @param {String} file 
 * @param {Array} tables 
 */
const generateSelf = function (file, table) {
  if (!fs.existsSync(file)) {
    return new Error('文件不存在')
  }
  const dist = process.env.packageWebDir;
  const template = lib.getTemplateF(file);

  let context = {}
  context._ = _;
  context.table = table;
  const content = template(context);
  const _path = lib.getOutputPath(path.basename(file), dist)

  lib.save2File(_path, content);
}

const scaffold = function* () {
  require('dotenv').config({
    path: process.env.ENV_FILE || '.env'
  });
  process.env.servicePackageUpperFirst = _.upperFirst(_.camelCase(process.env.serviceName));
  process.env.entity = _.upperFirst(_.camelCase(process.env.includeTables));
  process.env.entityPath = _.camelCase(process.env.includeTables);
  process.env.servicePackage =  _.toLower(_.camelCase(process.env.serviceName));
  process.env.entityKey =  _.toLower(process.env.entity);
  process.env.upperEntityPath = _.toUpper(_.camelCase(process.env.entity));

  // const { distRoot } = yield inquirerQ();
  const dbName = process.env.DB_NAME;
  const includeTables = process.env.includeTables;
  const dist = path.join(process.env.packageWebDir, '/.temp');
  const table = yield database.showColumns(dbName, includeTables);

  // Template settings.
  
  const _templateRoot = process.env.TEMPLATE_ROOT || 'templates';
  const templateRoot = path.isAbsolute(_templateRoot)
    ? _templateRoot : path.join(__dirname, _templateRoot);
  const templateExt = process.env.TEMPLATE_EXTENSION || '.ejs';

  // del.sync([dist]);

  walker(templateRoot)
    .filterDir(function (dir, stat) {
      
      const _path = path.join(templateRoot, 'node_modules')
      if (dir === _path) {
        return false;
      }
      return true;
    })
    .on('file', function (file, stat) {
      const basename = path.basename(file);
      const isTpl = basename.endsWith(templateExt);

      if (isTpl) {
        // 保存自身的普通模板，默认的 context 为 table
        generateSelf(file, table);
      } else {
        // 如果不是模板，则复制该文件到相应路径
        lib.copyStatic(file, dist, templateRoot);
      }
    });
}

module.exports = scaffold;

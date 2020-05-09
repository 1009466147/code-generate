根据数据库数据表制造的代码生成器  

使用ejs作为代码模板  
内置一套react的curd模板  

## 使用方式 npm run build  

## 配置在.env文件   
## [字段]服务名 转为驼峰用作命名  
serviceName=work  
## [字段]api地址  
route=GEEBOO_SCHOOL  
## [字段]过滤字段列表  
tenantColumn=["tenant_code"]  
## 模板路径  
TEMPLATE_ROOT=scholl_temp  
## 打包项目路径  
packageWebDir="C:\\Users\\Administrator\\Desktop\\project\\ui-school"  
## 表名 转为驼峰用作命名  
includeTables=work_student  
## 数据库的配置  
DB_HOST
host
DB_USER
用户名
DB_PASS
密码
DB_NAME
库名
## 可扩展  
## output.js 配置单个模板输出到指定地址指定文件名  
## lib/fileTypes.js 配置不同的模板使用不用的构造器  
## 简单改造下也可以不适用ejs 使用其他模板文件  如果后续有需要的话
  

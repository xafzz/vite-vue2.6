# 第二步 初始化Vue，实现 $mount
#### new Vue过程

    1、server.js 实现对vue解析
    2、直接安装vue-template-compiler
    3、获取vue文件里面的template跟script
    4、将写入vue文件，再将template跟script导出
        export default{
            template,
            script
        }
    5、单独操作 template 跟 script


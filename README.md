# 生成 render 函数，compile 结束

    1、模版缓存
    2、生成 render 函数  
    3、编译过程结束

    这个过程写完莫名的想笑，哈哈哈，难道生成 render 函数就是这样嘛？

### createCompileToFunctionFn(compile)
#### compileToFunctions(template,options) 生成render函数
###### 用模版字符串当 key ，缓存 rander 跟 不需要编译的代码 转成 函数
    1、经过 compile(template,options) 成功将模版 放入 cache 进行缓存了
    2、经过 const compiled = compile(template,options) 生产的 render
    3、res.render = createFunction(compiled.render,FnGenErrors) render 转成 render 函数
    4、render、staticRenderFns 转成函数 同时 缓存起来
        //render 是个函数 就是生成 render 函数呗？
        res.render = createFunction(compiled.render,FnGenErrors)
        //这是个数组啊 数组里面是个 function 可以为空 
        res.staticRenderFns = compiled.staticRenderFns.map(code => createFunction(code,FnGenErrors))

### createCompilerCreator(baseCompile)
#### createCompiler(baseOptions)
##### compile(template,options)
###### 检测有问题的表达式，detectErrors
    1、finalOptions 就是 options
    2、options 存在的时候
           if( options.modules ) 合并自定义 modules
           if( options.directives ) 合并自定义 directives
    3、detectErrors  检测有问题的表达式 这块很关键 但是现在没有写
           这块没有写 以后在补上
    

----
## 改动,详见分支 9.1-feature-update-server/server.js

    1、引入 @ 路径
    2、import的时候 可以不用 加后缀名，如 .js、index.js、.vue

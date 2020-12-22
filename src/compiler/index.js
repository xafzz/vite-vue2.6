/**
 *  TODO 理解的并不好 按照官方的 源码 来的
 *  vue-template-compiler 也是这么写的
 *  server 也用到了 vue-template-compiler 只是吧vue 文件的 template 跟 script 拿到 然后在进行处理
 *  柯里化
 *  加上 options 更加搞不明白了
 * */

import { baseOptions } from './options.js'
import parse from './parse/index.js'
import optimize from './optimizer.js'


//compile 是一个函数 有返回值
function createCompileToFunctionFn(compile){
    // console.log(3)
    let cache = Object.create(null)
    return function compileToFunctions(template,options){
        // console.log(4)
        //这句起到了很重要的作用
        //
        const compiled = compile(template,options)

        let res = {}
        let FnGenErrors = []

        // console.log(cache,compiled)

        // return compiled
    }
}

//吧整个函数当参数传进来 这是 函数 funciton baseCompile
function createCompilerCreator(baseCompile){
    // console.log(1)
    // console.log(baseCompile)
    //return createCompiler
    return function createCompiler(baseOptions){
        // console.log(2)
        // console.log(baseOptions)
        function compile(template,options){
            // console.log(5)
            let finalOptions = Object.create(baseOptions)
            let compiled = baseCompile(template.trim(),finalOptions)

            //其实还有错误
            // compiled.error={}
            // compiled.tips={}
            //
            // return compiled
        }
        return {
            compile:compile,
            compileToFunctions:createCompileToFunctionFn(compile)
        }
    }
}

//js 柯里化 逐步传参  参数复用 提前确认  延迟确认 bind
//没有实现 options 各种不行
const createCompiler = createCompilerCreator(function baseCompile(template,options){
    // console.log(6)
    //源码位置 vue/src/compiler/index.js
    //第一步 template生成ast
    //添加了 options 重写一遍 parse 过程
    options.whitespace = 'condense'
    let ast = parse(template.trim(),options)
    //第二步 优化器 打静态标记
    if (options.optimize !== false) {
        optimize(ast, options)
    }
    //第三步 生成代码 generate
    // const code = generate(ast, options)
})


const ref = createCompiler(baseOptions)
const compile = ref.compile
const compileToFunctions = ref.compileToFunctions


export {
    compileToFunctions,
    compile
}
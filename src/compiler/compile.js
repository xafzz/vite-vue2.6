/**
 *  TODO 理解的并不好 按照官方的 源码 来的
 *  vue-template-compiler 也是这么写的
 *  server 也用到了 vue-template-compiler 只是吧vue 文件的 template 跟 script 拿到 然后在进行处理
 *  柯里化
 *  加上 options 更加搞不明白了
 * */

import { baseOptions } from './options'
import parse from './parse/parse'
import optimize from './optimizer'
import generate from './codegen/generate'
import {extend, noop} from "../shared/util";

//在模版中检测有问题的表达式
function detectErrors(ast,warn){
    if(ast){
        // checkNode(ast,warn)
        //
    }
}

function createFunction( code,errors ){
    try{
        return new Function(code)
    }catch (err) {
        errors.push({ err:err,code:code })
        return noop
    }
}

//compile 是一个函数 有返回值
function createCompileToFunctionFn(compile){
    // console.log(3)
    let cache = Object.create(null)
    return function compileToFunctions(template,options){
        // console.log(4)
        options = extend({},options)

        let warn = options.warn
        delete options.warn
        //
        {
            try{
                new Function('return 1')
            }catch (e) {
                if (e.toString().match(/unsafe-eval|CSP/)) {
                    console.warn(
                        'It seems you are using the standalone build of Vue.js in an ' +
                        'environment with Content Security Policy that prohibits unsafe-eval. ' +
                        'The template compiler cannot work in this environment. Consider ' +
                        'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
                        'templates into render functions.'
                    )
                }
            }
        }
        //
        //检测缓存
        //undefined 啊
        //key 就是模版
        let key = options.delimiters
            ? String(options.delimiters) + template
            : template

        //将模版缓存起来
        if( cache[key] ){
            return cache[key]
        }

        //
        // //这句起到了很重要的作用
        // //也是undefined
        const compiled = compile(template,options)

        // todo createCompilerCreator->createCompiler->compile
        // 没有实现 是没有 errors跟tips
        // 没有实现 对模版里面表达式进行检测 detectErrors
        // 实现了 红字中的函数 才有 errors 跟 tips
        // 所以下面也是空的
        // // check compilation errors/tips
        {
            if( compiled.errors && compiled.errors.length ){

            }
            if( compiled.tips && compiled.tips.length ){

            }
        }

        //将代码转为函数
        //turn code into functions
        let res = {}
        let FnGenErrors = []
        //render 是个函数 这就是传说中的生成 render 嘛
        // 通过 new Function(code)
        res.render = createFunction(compiled.render,FnGenErrors)
        //这是个数组啊
        res.staticRenderFns = compiled.staticRenderFns.map(code => createFunction(code,FnGenErrors))

        // check function generation errors.
        // this should only happen if there is a bug in the compiler itself.
        // mostly for codegen development use
        //检查函数生成错误。
        //只有在编译器本身存在错误时才会发生这种情况。
        //主要用于codegen开发
        {
            if(
                ( !compiled.errors || !compiled.errors.length ) &&
                FnGenErrors.length
            ){
                console.warn('Failed to generate render function')
            }
        }

        return (cache[key]=res)
    }
}

//吧整个函数当参数传进来 这是 函数 funciton baseCompile
function createCompilerCreator(baseCompile){
    // console.log(1)
    return function createCompiler(baseOptions){
        // console.log(2)
        function compile(template,options){
            // console.log(5)
            let finalOptions = Object.create(baseOptions)
            let errors = []
            let tips = []

            //提示内容
            let warn = function (msg,range,tip){
                ( tip ? tips : errors ).push(msg)
            }

            // 将 options 塞入 finalOptions
            // 自定义 modules、directives 也在这里面 不过现在暂时没有
            if( options ){
                //这块 不是生产环境 就是 true
                if( options.outputSourceRange ){
                    let leadingSpaceLength = template.match(/^\s*/)[0].length

                    warn = function (msg,range,tip){
                        let data = { msg:msg }
                        if( range ){
                            if( range.start !=null ){
                                data.start = range.start + leadingSpaceLength
                            }
                            if( range.end !=null ){
                                data.end = range.end + leadingSpaceLength
                            }
                        }
                        ( tip ? tips : errors ).push(msg)
                    }
                }

                //合并自定义 modules
                if( options.modules ){
                    console.log('木有---->options.modules',options.modules)
                }
                //合并自定义 directives
                if( options.directives ){
                    console.log('木有---->options.modules',options.directives)
                }

                for (let key in options) {
                    if( key !== 'modules' && key !== 'directives' ){
                        finalOptions[key] = options[key];
                    }
                }
            }

            finalOptions.warn = warn

            let compiled = baseCompile(template.trim(),finalOptions)
            //todo 检测有问题的表达式 这块很关键 但是现在没有写
            // error 跟 tips 也没有
            {
                detectErrors(compiled.ast, warn);
            }

            //compileToFunctions() 才能进行下去
            compiled.errors = errors
            compiled.tips = tips
            //
            return compiled
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
    //源码位置 vue/src/compiler/parse.js
    //第一步 template生成ast
    //添加了 options 重写一遍 parse 过程
    //这个很关键 压缩模式
    // options.whitespace = 'condense'
    let ast = parse(template.trim(),options)
    //第二步 优化器 打静态标记
    if (options.optimize !== false) {
        optimize(ast, options)
    }
    //第三步 生成代码 generate
    const code = generate(ast, options)
    return {
        ast,
        render : code.render,
        staticRenderFns : code.staticRenderFns
    }
})


const ref = createCompiler(baseOptions)
const compile = ref.compile
const compileToFunctions = ref.compileToFunctions


export {
    compileToFunctions,
    compile
}

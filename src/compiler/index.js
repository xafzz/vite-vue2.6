/**
 *  TODO 理解的并不好 按照官方的 源码 来的
 *  vue-template-compiler 也是这么写的
 *  server 也用到了 vue-template-compiler 只是吧vue 文件的 template 跟 script 拿到 然后在进行处理
 *  柯里化
 *  加上 options 更加搞不明白了
 * */

import parse from './parse.js'
import optimize from './optimizer.js'
import {
    no,
    genStaticKeys
} from '../shared/util.js'
import {makeMap} from "./helpers.js";

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
    // console.log('处理的template字符串-->',template)
    //第一步 template生成ast
    //https://astexplorer.net/
    const ast = parse(template.trim(),options)
    //第二步 优化 就是打静态标记的过程
    if( options.optimize !== false ){
        optimize(ast,options)
    }
    //第三步 生成
    // var code = generate(ast, options);
    // console.log('生成的ast--->',ast)
    // console.log(111)
    // return {
    //     ast:ast
    // }
})

let isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
)

let isReservedTag = function (tag){
    return isHTMLTag(tag)
}
let modules = [

]

//搞成空的吧
let baseOptions = {
    expectHTML: true,
    isReservedTag : isReservedTag,
    staticKeys: ['staticClass'],
    // staticKeys:genStaticKeys(modules)
    // modules: modules$1,
    // directives: directives$1,
    // isPreTag: isPreTag,
    // isUnaryTag: isUnaryTag,
    // mustUseProp: mustUseProp,
    // canBeLeftOpenTag: canBeLeftOpenTag,
    // getTagNamespace: getTagNamespace,
    // staticKeys: genStaticKeys(modules$1)
}
//
const ref = createCompiler(baseOptions)
const compile = ref.compile
const compileToFunctions = ref.compileToFunctions


export {
    compileToFunctions,
    compile
}
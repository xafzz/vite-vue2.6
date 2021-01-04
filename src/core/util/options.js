

import config from '../config.js'
import { isBuiltInTag,hasOwn } from '../../shared/util.js'
import {LIFECYCLE_HOOKS} from "../../shared/constants";
/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
export const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 * 合并的策略处理options
 */
//写简单了
const strats = config.optionMergeStrategies //{}

/**
 * options with restrictions
 */
{
    strats.el = strats.propsData = function (parent, child, vm, key){
        if( !vm ){
            console.warn(`option ${key} can only be used during instance creation with the new keyword`)
        }
        return defaultStrat(parent,child)
    }
}

function mergeDataOrFn(parentVal,childVal,vm){
    //childVal 就是 页面中data
    if( !vm ){
        console.log('目前的实现中没有涉及到---->',vm)
    }else{
        return function mergedInstanceDataFn(){
            //合并实例
            let instanceData = typeof childVal === 'function'
                ? childVal.call(vm, vm)
                : childVal
            let defaultData = typeof parentVal === 'function'
                ? parentVal.call(vm, vm)
                : parentVal
            if( instanceData ){
                return mergeData(instanceData,defaultData)
            }else{
                return defaultData
            }
        }
    }
}
//递归将2个 数据对象合并到一个 helper 里
function mergeData(to,from){
    if( !from ){
        return to
    }
    console.log('------------------>mergeData,from：',from)
}
//options 里面的 data 处理
strats.data = function (parentVal,childVal,vm){
    //vm 就是 vue 本身 即 this
    if( !vm ){
        //没有return
        if( childVal && typeof childVal !== 'function' ){
            console.warn(`The "data" option should be a function, that returns a per-instance value in component definitions`)
            return parentVal
        }
        return mergeDataOrFn(parentVal,childVal)
    }
    return mergeDataOrFn(parentVal,childVal,vm)
}


function mergeHook(parentVal,childVal){
    let res = childVal
        ? parentVal
            ? parentVal.concat(childVal)
            : Array.isArray(childVal)
                ? childVal
                : [childVal]
        : parentVal
    return res
        ? dedupeHooks(res)
        : res
}
function dedupeHooks(hooks){
    let res = []
    for (let i = 0; i <hooks.length ; i++) {
        if( res.indexOf(hooks[i]) === -1 ){
            res.push(hooks[i])
        }
    }
    return res
}
//生命周期 合并
LIFECYCLE_HOOKS.forEach(hook=>{
    strats[hook]=mergeHook
})


/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
//child  就是 script里面的整个部分 具体的组件的
//parent  全局
//return $options 包含了当前组件中所有用到生命周期，data，watch，computed以及 过滤器 组件 自定义指令
export function mergeOptions( parent,child,vm ){

    //验证组件名称 我目前咩有用到 等后续看看是哪儿用到了
    //当前没有使用组件

    {
        checkComponents(child)
    }

    if( typeof child === 'function' ){
        console.log('typeof child === function--------->没有进来')
        // child = child.options
    }
    //props 这一步可以省略了 没有写 props
    normalizeProps(child, vm)
    //也没有他
    normalizeInject(child, vm)
    //将原始函数指令规范化为对象格式 没有自定义指令
    normalizeDirectives(child)

    // Apply extends and mixins on the child options,
    // but only if it is a raw options object that isn't
    // the result of another mergeOptions call.
    // Only merged options has the _base property.
    if( !child._base ){
        if (child.extends) {
            console.log('木有啊')
        }

        if (child.mixins) {
            console.log('木有啊')
        }
    }

    let options = {}
    let key
    // 这就是 global-api 里面添加的
    for (key in parent) {
        mergeFieId(key)
    }

    for ( key in child) {
        //检测parent 是否包含 key
        if( !hasOwn(parent,key) ){
            mergeFieId(key)
        }
    }

    //默认策略  优先组件里的属性
    function mergeFieId( key ){
        let strat = strats[key] || defaultStrat
        // console.log(key,strat)
        /*
            data:mergeDataOrFn->mergeData
         */
        options[key] = strat( parent[key], child[key], vm, key )
    }

    return options
}


/**
 * Default strategy.
 * 默认策略  优先组件里的属性
 */
let defaultStrat = (parentVal,childVal)=>{
    return childVal === undefined
        ? parentVal
        : childVal
}

//验证标签名称
function checkComponents( options ){

    for (const key in options.components) {
        validateComponentName(key)
    }
}
//验证组件名称
function validateComponentName(name){
    //
    if (!new RegExp(`^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`).test(name)) {
        console.warn(`
            Invalid component name: "${name}". 组件名称应符合html5规范中有效的自定义元素名称
        `)
    }

    if( isBuiltInTag(name) || config.isReservedTag(name) ){
        console.warn(`
            Do not use built-in or reserved HTML elements as component. id: ${name}
        `)
    }

}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 * props
 */
function normalizeProps(options,vm){
    let props = options.props
    if( !props ){
        return
    }
    console.log('我还没有写props')
}

/**
 * Normalize all injections into Object-based format
 * vue3里面不是就用 inject/provide 子子孙孙传值了嘛
 */
function normalizeInject( options,vm ){
    let inject = options.inject
    if( !inject ){
        return
    }
    console.log('也没有inject啊')
}


/**
 * Normalize raw function directives into object format.
 * 将原始函数指令规范化为对象格式
 */
function normalizeDirectives( options ){
    let dirs = options.directives
    if( dirs ){
        console.log('也没有这个')
    }
}

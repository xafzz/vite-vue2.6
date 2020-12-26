import { makeMap } from "../compiler/helpers.js";

//附录/shared/util.js 文件工具方法全解
//http://caibaojian.com/vue-design/appendix/shared-util.html
/**
 * Always return false.
 */
function no (a,b,c){ return false; }

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
function noop (a, b, c) {}

function genStaticKeys( modules ){
    //reduce() 方法接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值。
    return modules.reduce((keys,m)=>{
        return keys.concat(m.staticKeys || [])
    },[]).join(',')
}


//将属性混合到el中
function extend(el,_form){
    for( let key in _form ){
        el[key] = _form[key]
    }
    return el
}

/**
 * Check if a tag is a built-in tag.
 */
export const isBuiltInTag = makeMap('slot,component', true)


/**
 * Check whether an object has the property.
 * 检查对象 obj 是否具有属性值key
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
function hasOwn (obj, key) {
    return hasOwnProperty.call(obj, key)
}

export {
    no,
    noop,
    genStaticKeys,
    extend,
    hasOwn
}
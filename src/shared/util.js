import { makeMap } from "../compiler/helpers.js";

//又出来了 freeze
export const emptyObject = Object.freeze({})

// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.
//是空
export function isUndef (v){
    return v === undefined || v === null
}
//不为空
export function isDef(v){
    return v !== undefined && v !== null
}

export function isTrue (v) {
    return v === true
}

/**
 * Check if val is a valid array index.
 */
export function isValidArrayIndex (val) {
    const n = parseFloat(String(val))
    return n >= 0 && Math.floor(n) === n && isFinite(val)
}

/**
 * Check if value is primitive. 检测类型
 */
export function isPrimitive (value){
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        // $flow-disable-line
        typeof value === 'symbol' ||
        typeof value === 'boolean'
    )
}

export function isFalse (v) {
    return v === false
}

/**
 * Return the same value.
 */
export const identity = (_) => _

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

const isPromise = function (val){
    console.log('没有走到这儿---->isPromise',val)
    // return (
    //     isDef(val)
    // )
}

/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */
/* istanbul ignore next */
function polyfillBind (fn, ctx) {
    function boundFn (a) {
        const l = arguments.length
        return l
            ? l > 1
                ? fn.apply(ctx, arguments)
                : fn.call(ctx, a)
            : fn.call(ctx)
    }

    boundFn._length = fn.length
    return boundFn
}
function nativeBind( fn,ctx ){
    return fn.bind(ctx)
}

const bind = Function.prototype.bind ? nativeBind : polyfillBind

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
const _toString = Object.prototype.toString

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject(obj){
    return _toString.call(obj) === '[object Object]'
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
    return obj !== null && typeof obj === 'object'
}

//Dep 移除依赖
function remove(arr,item){
    if( arr.length ){
        //获取下标
        let index = arr.indexOf(item)
        //存在的时候 我才 删除
        if( index > -1 ){
            return arr.slice(index,1)
        }
    }
}

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start){
    start = start || 0
    let i = list.length - start
    const ret = new Array(i)
    while (i--) {
        ret[i] = list[i + start]
    }
    return ret
}


/**
 * 将值转换为实际呈现的字符串。
 */
function toString( val ){
    return val == null
        ? ''
        : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
            ? JSON.stringify(val, null, 2)
            : String(val)

}

/**
 * 将输入值转换为数字以保持持久性。
 * 如果转换失败，则返回原始字符串
 */
function toNumber (val) {
    const n = parseFloat(val)
    return isNaN(n) ? val : n
}

export function isRegExp (v) {
    return _toString.call(v) === '[object RegExp]'
}

export {
    no,
    noop,
    genStaticKeys,
    extend,
    hasOwn,
    isPromise,
    bind,
    isPlainObject,
    isObject,
    remove,
    toArray,
    toString,
    toNumber
}

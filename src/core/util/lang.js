
/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
export const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/

/**
 * Check if a string starts with $ or _
 * 字符开头是否以$ or _
 */
export function isReserved (str) {
    const c = (str + '').charCodeAt(0)
    return c === 0x24 || c === 0x5F
}

export function def(obj,key,val ,enumerable ){
    Object.defineProperty(obj,key,{
        //该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。
        // 默认为 undefined。
        value:val,
        //当且仅当该属性的 enumerable 键值为 true 时，该属性才会出现在对象的枚举属性中。
        // 默认为 false。
        enumerable:!!enumerable,
        //当且仅当该属性的 writable 键值为 true 时，属性的值，也就是上面的 value，才能被赋值运算符改变。
        // 默认为 false。
        writable:true,
        //当且仅当该属性的 configurable 键值为 true 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除。
        // 默认为 false
        configurable:true
    })
}


/**
 * 解析简单路径.
 */
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)
export function parsePath (path) {
    /*
        例子 ：
        watch:{
            show(){
                console.log('show is change',this.show)
            },
        },
     */
    // path = show
    if (bailRE.test(path)) {
        return
    }
    // segments = ['show']
    const segments = path.split('.')
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return
            //拿到值
            obj = obj[segments[i]]
        }
        return obj
    }
}


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

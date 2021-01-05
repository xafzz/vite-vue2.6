/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */


import {def} from "../util";

let arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
    'push',     //向数组的末尾添加一个或多个元素，并返回新的长度
    'unshift',  //向数组的开头添加一个或更多元素，并返回新的长度。
    'pop',      //删除数组的最后一个元素并返回删除的元素
    'shift',    //删除并返回数组的第一个元素。
    'splice',   //从数组中添加或删除元素。
    'sort',     //对数组的元素进行排序
    'reverse'   //反转数组的元素顺序
]

/**
 * Intercept mutating methods and emit events
 * todo 很好 没明白
 */
methodsToPatch.forEach(method=>{
    // cache original method
    //缓存原始方法
    let original = arrayProto[method]
    def(arrayMethods,method,(...args)=>{
        let result = original.apply(this,args)
        let ob = this.__ob__
        let inserted
        switch (method) {
            case 'push' :
            case 'unshift' :
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)
                break
        }
        if( inserted ){
            ob.observeArray(inserted)
        }
        ob.dep.notify()
        return result
    })
})

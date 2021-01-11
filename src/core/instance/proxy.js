import {makeMap} from "../../compiler/helpers";
import {isNative} from "../util";
import config from "../config";

let initProxy

{

    let allowedGlobals = makeMap(
        'Infinity,undefined,NaN,isFinite,isNaN,' +
        'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
        'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
        'require' // for Webpack/Browserify
    )

    let warnNonPresent = (target, key) => {
        console.warn(
            `Property or method "${key}" is not defined on the instance but ` +
            'referenced during render. Make sure that this property is reactive, ' +
            'either in the data option, or for class-based components, by ' +
            'initializing the property. ' +
            'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
            target
        )
    }

    let warnReservedPrefix = (target, key) => {
        console.warn(
            `Property "${key}" must be accessed with "$data.${key}" because ` +
            'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
            'prevent conflicts with Vue internals. ' +
            'See: https://vuejs.org/v2/api/#data',
            target
        )
    }

    // 判断当前环境中 Proxy 是否可用
    let hasProxy = typeof Proxy !== 'undefined' && isNative(Proxy)

    if( hasProxy ){
        //创建一个 特殊健  映射集合
        const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact')
        config.keyCodes = new Proxy(config.keyCodes,{
            set(target, key, value, receiver) {
                console.log('打印下看看什么时候触发')
                if (isBuiltInModifier(key)) {
                    console.warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`)
                    return false
                } else {
                    target[key] = value
                    return true
                }
            }
        })

    }

    //应用场景在于查看vm实例是否拥有某个属性
    //比如调用for in循环遍历vm实例属性时，会触发hasHandler方法。
    // 生成的 render 函数里面 有 _v _c _m等 这就是检查 vm 上是否已经有了这些函数
    let hasHandler = {
        has( target,key ){
            // key  _v _c _m
            const has = key in target
            // allowedGlobals最终存储的是一个代表特殊属性名称的映射表
            const isAllowed = allowedGlobals(key) || ( typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data) )
            if( !has && !isAllowed ){
                if (key in target.$data){
                    warnReservedPrefix(target, key)
                }else{
                    warnNonPresent(target, key)
                }
            }
            return has || !isAllowed
        }
    }

    // 针对读取代理对象的某个属性时进行的操作
    // 当访问的属性不是string类型或者属性值在被代理的对象上不存在，则抛出错误提示，否则就返回该属性值。
    // 该方法可以在开发者错误的调用vm属性时，提供提示作用。
    let getHandler = {
        get( target,key ){
            console.log('什么时候可以打印下呢')
            if (typeof key === 'string' && !(key in target)) {
                if (key in target.$data) {
                    warnReservedPrefix(target, key)
                } else {
                    warnNonPresent(target, key)
                }
            }
            return target[key]
        }
    }

    initProxy = function initProxy(vm){
        if( hasProxy ){
            //确定要使用的代理处理程序
            let options = vm.$options
            //options 存在 render
            //todo 但是 _withStripped 这个是干啥的？
            let handlers = options.render && options.render._withStripped
                ? getHandler
                : hasHandler

            vm._renderProxy = new Proxy(vm,handlers)
        }else{
            console.log('什么时候不支持proxy')
            //跟在生产环境一样
            vm._renderProxy = vm
        }
    }
}

export { initProxy }

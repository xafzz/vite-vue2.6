import Dep from "./dep";
import {def, hasProto, isServerRendering} from "../util";
import {hasOwn, isObject, isPlainObject, isPrimitive, isUndef, isValidArrayIndex} from "../../shared/util";
import {Vnode} from "../vdom/vnode";
import {arrayMethods} from "./array";

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
export let shouldObserve = true

export default class Observer{
    constructor(value) {
        this.value = value
        this.dep = new Dep()
        this.vmCount = 0

        //有没有 __ob__ 判断是不是响应式数据
        // /src/core/util/lang.js
        // 给value新增一个__ob__属性，值为该value的Observer实例
        // 相当于为value打上标记，表示它已经被转化成响应式了，避免重复操作
        def(value,'__ob__',this)
        //数组跟object分开处理
        if( Array.isArray(value) ){
            //todo 在什么时候 不能用 __proto__
            if( hasProto ){
                protoAugment(value,arrayMethods)
            }else{
                console.log('在什么时候 不能用 __proto__？weex？')
            }
            this.observeArray(value)
        }else{
            this.walk(value)
        }
    }

    /**
     * Walk through all properties and convert them into
     * getter/setters. This method should only be called when
     * value type is Object.
     */
    walk(obj){
        let keys = Object.keys(obj)
        // console.time()
        // keys.forEach(val=>{
        //     console.log('forEach->',val)
        // })
        // console.timeEnd()
        // 虽然每次时间 都不一样 但是 for要快一点
        // 但是下面这种情况 forEach要明显快很多
        // keys = new Array(3)
        // keys[0] =1
        // keys[999] =2
        // console.time()
        for (let i = 0; i < keys.length ; i++) {
            defineReactive(obj,keys[i])
        }
        // console.timeEnd()
        // console.log(keys)
    }

    //观察数组项的列表
    observeArray(items){
        for (let i = 0; i <items.length ; i++) {
            observe(items[i])
        }
    }
}

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 * 通过使用__proto__截取原型链来增强目标对象或数组
 */
function protoAugment(target,src){
    target.__proto__ = src
}

/**
 * 使一个对象转化成可观测对象
 * @param { Object } obj 对象
 * @param { String } key 对象的key
 * @param { Any } val 对象的某个key的值
 * @param { ? Function } customSetter 对象的某个key的值
 * @param { ? boolean } shallow 对象的某个key的值
 */
export function defineReactive(obj,key,val,customSetter,shallow){
    const dep = new Dep()
    /*
        getOwnPropertyDescriptor 返回指定对象上一个自由属性对应的属性描述符
        configurable
        enumerable
        value
        writable
        /src/core/util/lang.js def 里面有说明
     */
    const property = Object.getOwnPropertyDescriptor(obj,key)
    //不能被修改
    if( property && property.configurable === false ){
        return
    }

    // cater for pre-defined getter/setters
    // 都是 undefined
    let getter = property && property.get
    let setter = property && property.set

    //arguments 是一个对应于传递给函数的参数的类数组对象。
    //文档地址：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/arguments
    // console.log(arguments)
    // 如果只传了obj和key，那么val = obj[key]
    if ((!getter || setter) && arguments.length === 2) {
        val = obj[key]
    }

    //还是递归吧 字元素 一个object 一个 Observer
    //todo 如何确定父元素呢
    let childOb = !shallow && observe(val)

    Object.defineProperty(obj, key, {
        enumerable:true,
        configurable:true,
        get:function reactiveGetter(){
            //也可以让走 在浏览器控制台 直接点击
            //函数 返回函数 ，其他直接返回 函数
            if (getter){
                console.log('有getter，打印下-->',getter,'还有obj---->',obj)
            }
            let value = getter ? getter.call(obj) : val
            if( Dep.target ){
                console.log('Dep.target 木有值啊，有值的话 我在过来补上',Dep.target)
            }
            return value
        },
        set:function reactiveSetter(newVal) {
            let value = getter ? getter.call(obj) : val
            //重复赋值
            if( newVal === value || (newVal !== newVal && value !== value) ){
                return
            }
            if( customSetter ){
                //initRender 的时候 打印 警告信息
                console.log('我也不知道这是啥customSetter：',customSetter)
                customSetter()
            }

            // #7981: for accessor properties without setter
            if (getter && !setter) return

            if( setter ){
                console.log('有setter，打印下-->',setter,'还有obj---->',obj)
                setter.call(obj,newVal)
            }else{
                val = newVal
            }
            childOb = !shallow && observe(newVal)
            dep.notify()
        }
    })
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 * 尝试为某个值创建一个观察者实例，
 * 如果成功观察到该观察者，则返回新的观察者，
 * 如果该值已有一个观察者，则返回现有的观察者。
 */
export function observe( value, asRootData ){

    // src/core/instance/instance.js
    // this instanceof Vue
    if( !isObject(value) || value instanceof Vnode ){
        return
    }
    let ob
    //Observer 类里面 用 __ob__ 判断是否标记为 响应式数据
    if( hasOwn(value,'__ob__') && value.__ob__ instanceof  Observer){
        console.log('走这的时候 提示下')
    }

    if(
        shouldObserve &&   // true
        !isServerRendering() && //isServerRendering() 默认是 false，可以设置
        ( Array.isArray(value) || isPlainObject(value)) && //数组 或者是 object
        Object.isExtensible(value) && //方法判断一个对象是否是可扩展的（是否可以在它上面添加新的属性）。
        !value._isVue //没有啊 vue 实例上 倒是又一个 但不是那个
    ){
        ob = new Observer(value)
    }
    if( asRootData && ob ){
        ob.vmCount ++
    }
    return ob
}

/**
 * set a property on an object. adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
/**
 *
 * @param target { Array<any> | Object }
 * @param key { any }
 * @param val { any }
 */
export function set(target,key,val){
    /*
        测试用例
        let obj= {
            a:1
        }
        set(obj,'b','2')
     */
    // isUndef 不为空
    if( isUndef(target) || isPrimitive(target) ){
        console.warn('Cannot set reactive property on undefined, null, or primitive value: ' + target)
    }
    //是数组 并且是 有效的索引
    if( Array.isArray(target) && isValidArrayIndex(key) ){
        target.length = Math.max(target.length,key)
        target.splice(key,1,val)
        return val
    }

    if( key in target && !(key in Object.prototype) ){
        target[key] = val
        return val
    }
    //是否是响应式数据
    //要设置 首先他要是一个响应式数据
    let ob = (target).__ob__
    if( target._isVue || ( ob && ob.vmCount ) ){
        console.warn(`'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'`)
        return val
    }

    if( !ob ){
        target[key] = val
        return val
    }

    defineReactive( ob.value, key, val )
    ob.dep.notify()
    return val
}

/**
 * @description 删除属性，并在必要时触发更改。
 * @param target { Array<any> | Object }
 * @param key { any }
 */
export function del( target,key ){
    /*
        测试用例
        let obj= {
            a:1,
            b:2
        }
        observe(obj)
        del(obj,'b')
     */
    // isUndef 不为空
    if( isUndef(target) || isPrimitive(target) ){
        console.warn('Cannot set reactive property on undefined, null, or primitive value: ' + target)
    }

    //是数组 并且是 有效的索引
    if( Array.isArray(target) && isValidArrayIndex(key) ){
        target.splice(key, 1)
    }

    //是否是响应式数据
    //要设置 首先他要是一个响应式数据
    let ob = (target).__ob__
    if( target._isVue || ( ob && ob.vmCount ) ){
        console.warn(`Avoid deleting properties on a Vue instance or its root $data - just set it to null`)
        return
    }

    //不存在的时候
    if( !hasOwn(target,key) ){
        return
    }

    delete target[key]
    //不是响应式数据
    if( !ob ){
        return
    }
    ob.dep.notify()
}

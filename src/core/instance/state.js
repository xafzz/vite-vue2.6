
import {bind, hasOwn, isPlainObject, noop} from "../../shared/util";
import {handleError, isReserved, isServerRendering, nativeWatch} from "../util";
import {del, observe, set} from "../observer/observe";
import Dep, {popTarget, pushTarget} from "../observer/dep";
import Watcher from "../observer/watcher";

export function initState( vm ){

    vm._watchers = []
    let opts = vm.$options
    //props
    if( opts.props ){
        console.log('initState------>没有props')
    }
    //methods
    if( opts.methods ){
        initMethods(vm,opts.methods)
    }
    //data 并将数据变成响应式数据
    if( opts.data ){
        initData(vm)
    }else{
        observe(vm._data={},true /* asRootData */)
    }
    //computed
    if( opts.computed ){
        //vm._computedWatchers
        //内部创建了 watcher
        initComputed(vm,opts.computed)
    }
    //watch
    if( opts.watch && opts.watch !== nativeWatch ){
        initWatch(vm,opts.watch)
    }else{
        console.log('watch 什么时候相等了nativeWatch',nativeWatch)
    }
}

//methods
function initMethods( vm,methods ){
    //methods 函数名称不能与props重名
    let props = vm.$options.props
    for (const key in methods) {
        {
            //必须是个函数
            if( typeof methods[key] !== 'function' ){
                console.warn(`Method '${key}' has type '${typeof methods[key]}' in the component definition.Did you reference the function correctly?`)
            }
            //methods 函数名称不能与props重名
            if( props && hasOwn(props,key) ){
                console.warn(`Method "${key}" has already been defined as a prop.`)
            }
            // 不能是 vue 关键字
            // 字符开头 不能以 $ or _
            if( (key in vm) && isReserved(key) ){
                console.warn(`Method "${key}" conflicts with an existing Vue instance method.Avoid defining component methods that start with _ or $. `)
            }
        }

        vm[key] = typeof methods[key] !== 'function'
            ? noop
            : bind(methods[key],vm)  //this指针 call apply bind
    }
}

/*
    又到 src/core/util/options.js 合并 options
    这个可不是 data return 的 object
    因为在 11.5-initMixin-callHook-mergeOptions 处理过了
    strats.data = function (parentVal,childVal,vm) 就是用这个处理的 要不就是 一个 object
    todo 至于为什么要处理一下 可以先记录下
 */
function initData(vm){
    let data = vm.$options.data
    //又拿到 data return 的原始值
    data = vm._data = typeof data == 'function'
        ? getData(data,vm)
        : data || {}

    //data 必须是一个 object
    if( !isPlainObject(data) ){
        data = {}
        console.warn(`data functions should return an object:https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function`)
    }

    // 实例上代理数据
    // 命名不能与methods、props重名
    let keys = Object.keys(data)
    let props = vm.$options.props
    let methods = vm.$options.methods
    let i = keys.length
    while (i--){
        let key = keys[i]
        {
            //data与methods 名称重复
            if( methods && hasOwn(methods,key) ){
                console.warn(`Method "${key}" has already been defined as a data property.`)
            }
        }
        //data与 props 名称重复
        if( props && hasOwn(props,key) ){
            console.warn(`The data property "${key}" is already declared as a prop.Use prop default value instead. `)
        }else if( !isReserved(key) ){
            //不是以 _ or $ 开头
            //代理数据
            proxy(vm,`_data`,key)
        }
    }
    // observe data
    //处理成响应式数据
    observe(data, true /* asRootData */)
}

/**
 * @description 通过 call 拿到 data return 的原始值
 * @param data { Function }
 * @param vm { Vue }
 */
function getData( data,vm ){
    //这个过程禁用 dep
    pushTarget()
    try {
        return data.call(vm,vm)
    } catch (e) {
        console.log('报个错给我看看----->getData',e)
        handleError(e,vm,`data()`)
        return {}
    } finally {
        popTarget()
    }
}

//看样子跟个响应式数据结构似的
const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

//代理数据
export function proxy(target,sourceKey,key){
    sharedPropertyDefinition.get = function proxyGetter(){
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val){
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

const computedWatcherOptions = { lazy: true }

//computed
function initComputed(vm,computed){

    let watchers = vm._computedWatchers = Object.create(null)
    // computed properties are just getters during SSR
    // false
    let isSSR = isServerRendering()

    for (const key in computed) {
        //computed
        let userDef = computed[key]
        /*
            changeComputed(){
                return this.msg * 2
            },
            computedParams:{
                get:function (param){
                    return this.msg * param * 2
                }
            }
         */
        let getter = typeof userDef === 'function' ? userDef : userDef.get

        if( getter == null ){
            console.warn(`Getter is missing for computed property "${key}".`)
        }

        if( !isSSR ){
            // 为计算的属性创建内部监视程序
            // 为每个 computed 函数 创建一个 watcher
            watchers[key] =new Watcher( vm, getter || noop, noop, computedWatcherOptions )
        }else{
            console.log('什么时候 isSSR 是 true？',isSSR)
        }

        // 组件定义的计算属性已经在组件原型上定义。
        // 我们只需要定义在实例化时定义的计算属性。
        if( !(key in vm) ){
            //todo 是在这里面缓存的？这个就不明白了
            defineComputed(vm, key, userDef)
        }else{
            if (key in vm.$data) {
                console.warn(`The computed property "${key}" is already defined in data.`)
            } else if (vm.$options.props && key in vm.$options.props) {
                console.warn(`The computed property "${key}" is already defined as a prop.`)
            }
        }
    }
}

/**
 *
 * @param target { Vue }
 * @param key { string } 函数名称
 * @param userDef { Object | Function } 函数
 */
export function defineComputed( target, key, userDef ){
    let shouldCache = !isServerRendering()
    if( typeof userDef === 'function' ){
        sharedPropertyDefinition.get = shouldCache
            ? createComputedGetter(key)
            : createGetterInvoker(userDef)
        sharedPropertyDefinition.set = noop
    }else{
        sharedPropertyDefinition.get = userDef.get
            ? shouldCache && userDef.cache !== false
                ? createComputedGetter(key)
                : createGetterInvoker(userDef.get)
            : noop
        sharedPropertyDefinition.set = userDef.set || noop
    }

    if( sharedPropertyDefinition.set === noop ){
        sharedPropertyDefinition.set = function (){
            console.warn(`Computed property "${key}" was assigned to but it has no setter.`)
        }
    }
    //代理
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

//缓存是在这创建的嘛？
//计算属性
/*
    游走过程
    at Proxy.computedGetter (state:254)
    at eval (eval at createFunction (compile:25), <anonymous>:3:582)
    at Proxy.renderList (render-list:31)
    at Proxy.eval (eval at createFunction (compile:25), <anonymous>:3:481)
    at Vue._render (render:92)
    at Vue.updateComponent (lifecycle:38)
    at Watcher.get (watcher:119)
    at new Watcher (watcher:102)
    at mountComponent (lifecycle:68)
    at Vue.$mount (runtime:14)
 */
function createComputedGetter(key){
    /*
        computed:{
            changeComputed(){
                return this.msg * 2
            },
            computedParams(){
                return (param)=>{
                    return this.msg * param * 2
                }
            }
        },

        key 就是 changeComputed、computedParams
     */
    return function computedGetter(){
        //计算属性存放到这儿
        let watcher = this._computedWatchers && this._computedWatchers[key]
        //每个 computed 创建 一个 watcher 表达式在 expression 里面
        // console.log(watcher)
        if( watcher ){
            // console.log('走到这儿的时候打印下没明白',Dep.target)
            // 在 watcher 里面，this.dirty = this.lazy
            // this.lazy 在计算属性的时候穿进去 是 true
            // src/core/observer/watcher.js 里面有注释
            if( watcher.dirty ){
                watcher.evaluate()
            }
            //这也是有值的 就是 vm 本身
            if( Dep.target ){
                watcher.depend()
            }
            return watcher.value
        }else{
            console.log('不会啊不可能没有的啊')
        }
    }
}

function createGetterInvoker(fn) {
    return function computedGetter () {
        return fn.call(this, this)
    }
}

//watch
function initWatch( vm,watch ){
    for (const key in watch) {
        let handler = watch[key]
        if( Array.isArray(handler) ){
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        }else{
            createWatcher(vm, key, handler)
        }
    }
}

/**
 *
 * @param vm { Vue }
 * @param expOrFn { string | Function } watch 函数名称
 * @param handler { any } 函数
 * @param options { ?Object }
 */
function createWatcher( vm, expOrFn, handler, options){

    //函数体是一个 object
    if( isPlainObject(handler) ){
        console.log('这种方式我用的比较少')
        options = handler
        handler = handler.handler
    }

    if( typeof handler === 'string' ){
        console.log('这种方式我用的比较少')
        handler = vm[handler]
    }

    // $watch 没有啊 看了下源码 $watch 在 stateMixin 这不坑了嘛
    // 写上 prototype.$watch
    // if( typeof vm.$watch === 'function' ){
        return vm.$watch(expOrFn,handler,options)
    // }
}


//stateInit
//重新构建
export function stateMixin( Vue ){

    // flow somehow has problems with directly declared definition object
    // when using Object.defineProperty, so we have to procedurally build up
    // the object here.
    // todo 不明白
    // 箭头函数会不会有出现this 丢失问题
    let dataDef = {}
    //在 src/core/instance/render.js Vue.prototype._render时
    //vnode = render.call(vm._renderProxy,vm.$createElement)
    // 报错 Cannot read property '_data' of undefined
    // dataDef.get = () => this._data
    dataDef.get = function(){
        return this._data
    }
    let propsDef = {}
    // propsDef.get = () => this._props
    propsDef.get = function(){
        return this._props
    }

    {
        dataDef.set = () => console.warn('Avoid replacing instance root $data.Use nested data properties instead.')
        propsDef.set = () => console.warn('props is readonly.')
    }
    //在vue原型上 添加 $data/$props 并且这两个只是可读属性
    Object.defineProperty(Vue.prototype,'$data',dataDef)
    Object.defineProperty(Vue.prototype,'$props',propsDef)

    //在原型上 添加 $set $delete 已在 observe 实现
    Vue.prototype.$set = set
    Vue.prototype.$delete = del

    /**
     * 在 createWatcher() 用到了
     * @param expOrFn {string | Function}
     * @param cb { any }
     * @param options { ?Object }
     */
    Vue.prototype.$watch = function ( expOrFn,cb,options ){
        let vm = this
        if( isPlainObject(cb) ){
            console.log('cb你是一个对象了')
            return createWatcher(vm, expOrFn, cb, options)
        }

        options = options || {}

        //watch 的时候 user = true
        //computed 的时候 lazy = true
        options.user = true
        //从这儿 完善 watcher 里面 typeof expOrFn !== 'function' 完善 Watcher.prototype.get
        //生成一条 跟 watch 有关的详细内容 同时 插入到了
        let watcher = new Watcher(vm,expOrFn,cb,options)
        if( options.immediate ){
            console.log('options.immediate 这是干什么的',options.immediate)
        }

        return function unwatchFn(){
            //从所有依赖项的订阅者列表中删除自身
            // 暂时没有用到
            watcher.teardown()
        }
    }
}

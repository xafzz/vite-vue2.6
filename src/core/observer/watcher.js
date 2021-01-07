import {handleError, parsePath} from "../util";
import {noop} from "../../shared/util";
import {popTarget, pushTarget} from "./dep";


let uid = 0
/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
/**
 *
 * @param vm { Component }
 * @param expOrFn { string | Function }
 * @param cb { Function }
 * @param options { ? Object }
 * @param isRenderWatcher  { ? boolean }
 * @constructor
 */

const Watcher = function(vm,expOrFn,cb,options,isRenderWatcher){

    /*
    1、从 initMixin -> initState -> initComputed
        expOrFn 就是 computed 函数本身
        cb 始终是 function
        options {lazy: true} 难道这就是传说中的 缓存？
        isRenderWatcher undefined
    */
    this.vm = vm
    //渲染wathcer?
    if( isRenderWatcher ){
        vm._watcher = this
    }
    //把整个 watcher 放进来
    //每个computed的watcher 放进去
    vm._watchers.push(this)

    if( options ){
        //todo 没有用到 不知道干啥的
        this.deep = !!options.deep
        this.user = !!options.user
        this.sync = !!options.sync
        this.before = options.before

        //从 initMixin -> initState -> initComputed
        // options {lazy: true} this.lazy为true
        this.lazy = !!options.lazy
    }else{
        this.deep = this.user = this.lazy = this.sync = false
    }

    this.cb = cb
    this.id = ++ uid
    this.active = true
    this.dirty = this.lazy

    //应该是跟dep有关的
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    //把函数转成字符串了
    this.expression = expOrFn.toString()

    /*
        expOrFn
        computed 是一个 函数
        watch 是一个 string
     */
    if( typeof expOrFn === 'function' ){
        //现在getter 就是 计算属性那个函数了
        this.getter = expOrFn
    }else{
        /*
            例子 ：
            watch:{
                show(){
                    console.log('show is change',this.show)
                },
            },
            expOrFn 就是 show
         */
        //开始不明白 跟着例子 打印下明白了
        //在下面 this.getter.call 的时候 从 vue 上找对应的属性、值
        this.getter = parsePath(expOrFn)
        if( !this.getter ){
            this.getter = noop
            console.warn(`Failed watching path: "${expOrFn}" . Watcher only accepts simple dot-delimited paths.For full control, use a function instead. `)
        }
    }

    //为什么要这么做？
    //computed跟watch都走一遍 走一遍this.get
    /*
         computed 的时候 this.lazy 是传进来的值 是 ture
                        是一个函数 值也是空的
         watch 的时候 是没有值的
                     是从data 来的
     */
    this.value = this.lazy ? undefined : this.get()
}
//watcher 的get 在 watch 的时候用到了
Watcher.prototype.get = function (){
    //Dep.target
    pushTarget(this)
    let value
    // 就是 vue
    let vm = this.vm
    try {
        //拿到值了
        /*
            问题1： 同时 Dep.target 也有值了，怎么赋值的？
            答：在上面 pushTarget 的时候，把 Dep.target = vm
            问题2： 在这赋值完成以后 怎么又到 observe 里面了 不是先到那儿吗
            答：initState 阶段的时候已经将数据变成了响应式数据 watch 取值的时候,就是触发了它的get() 所以在这有执行了
         */
        value = this.getter.call(vm,vm)
    }catch (e) {
        if( this.user ){
            handleError(e,vm,`getter for watcher "${this.expression}"`)
        }else{
            throw e
        }
        console.log('等提示了再来做')
    }finally {
        // "touch" every property so they are all tracked as
        // dependencies for deep watching
        //深度监听并跟踪依赖
        if(this.deep){
            console.log('没有进来')
        }
        popTarget()
        this.cleanupDeps()
    }
    return value
}

// 收集依赖 到 Dep depend里面 然后 到到这儿
// watch 的时候 添加一个了
Watcher.prototype.addDep = function (dep){
    let id = dep.id
    if( !this.newDepIds.has(id) ){
        //设置 newDepIds 集合
        this.newDepIds.add(id)
        this.newDeps.push(dep)
        //没有地方设置啊
        if( !this.depIds.has(id) ){
            //为什么要在执行一次
            dep.addSub(this)
        }
    }
}
//依赖通知更新 Dep notify
//该方法会触发 run
//肯定要有个删除的操作 要不玩不转转
Watcher.prototype.update = function () {
    console.log('---------->Watcher.prototype.update')
}

Watcher.prototype.cleanupDeps = function (){
    let i = this.deps.length
    while (i--){
        console.log('现在是0 把')
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
}

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function (){
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    console.log('这是teardown,什么时候走到这了')

}

export default Watcher

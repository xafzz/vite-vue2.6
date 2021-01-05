


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
    this.newDepId = new Set()
    //把函数转成字符串了
    this.expression = expOrFn.toString()

    if( typeof expOrFn === 'function' ){
        //现在getter 就是 计算属性那个函数了
        this.getter = expOrFn
    }else{
        console.log('还没有碰到这种情况')
    }

    //todo 为什么要这么做
    this.value = this.lazy ? undefined : this.get()
}

// 收集依赖 到 Dep depend里面 然后 到到这儿
Watcher.prototype.addDep = function (){
    console.log('---------->Watcher.prototype.addDep')
}
//依赖通知更新 Dep notify
//该方法会触发 run
//肯定要有个删除的操作 要不玩不转转
Watcher.prototype.update = function () {
    console.log('---------->Watcher.prototype.update')
}


export default Watcher

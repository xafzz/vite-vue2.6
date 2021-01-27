import {popTarget, pushTarget} from "../observer/dep";
import {invokeWithErrorHandling, noop} from "../util";
import config from "../config";
import {mark, measure} from "../util/perf";
import Watcher from "../observer/watcher";

//正在更新子组件
export let isUpdatingChildComponent = false

/**
 *
 * @param vm { any|Vue }
 * @param el { any|#app节点内容 }
 * @param hydrating { boolean|默认false，猜测跟ssr有关 }
 */
export function mountComponent( vm,el,hydrating ){

    //el 挂载到 this.$el 上
    vm.$el = el
    if( !vm.$options.render ){
        console.log('vm.$options.render 没有的时候?跟打包有关系？',vm.$options)
    }
    //意外惊喜 beforeMount 藏在这儿
    callHook(vm,'beforeMount')

    //更新组件？
    let updateComponent
    //这个不多做解释
    //在这 开启 performance
    if( config.performance && mark ){
        updateComponent = () => {
            let name = vm._name
            let id = vm._uid
            let startTag = `vue-perf-start:${id}`
            let endTag = `vue-perf-end:${id}`

            mark(startTag)
            /*
                调用 createElement 将 compile 生成的 js dom 树 转成 vnode
                这个过程跟 compile 时的 压缩模式有密切的关系
                同样他也有2中模式 就是在 src/core/vdom/helpers/normalize-children.js
                到这儿位置 其实 生成了 我们想要的东西 而且 数据也已经 组装成了 真是的数据
             */
            let vnode = vm._render()
            mark(endTag)
            measure(`vue ${name} render`,startTag,endTag)

            //绕了一大圈以后,终于又回来了 vnode 也有值了

            mark(startTag)
            vm._update(vnode,hydrating)
            mark(endTag)
            measure(`vue ->${name}<- patch`,startTag,endTag)

        }
    }else{
        updateComponent = () => {
            console.log('没有走这儿')
            // vm._update(vm._render(),hydrating)
        }
    }


    // 我们将其设置为观察者的构造函数中的vm._watcher，
    // 因为观察者的初始补丁可能会调用forceUpdate（例如，在子组件的已挂接钩子内部），
    // 它依赖于已经定义的vm._watcher
    // 对这块不是很理解 在敲下去看看
    /*
        游走的过程
        at Proxy.computedGetter (state:244)
        at eval (eval at createFunction (compile:25), <anonymous>:3:582)
        at Proxy.renderList (render-list:31)
        at Proxy.eval (eval at createFunction (compile:25), <anonymous>:3:481)
        at Vue._render (render:92)
        at Vue.updateComponent (lifecycle:38)
        at Watcher.get (watcher:119)
        at new Watcher (watcher:102)
        at mountComponent (lifecycle:61)
        at Vue.$mount (runtime:14)
     */
    //todo 完善 patch 再来看这块
    new Watcher(vm, updateComponent, noop, {
        before(){
            console.log('什么时候来这')
        }
    }, true /* isRenderWatcher */)

    //重置成？ false
    hydrating = false

    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    // 手动安装的实例，调用安装在自安装实例上的调用会在其插入的挂钩中调用渲染创建的子组件
    /*
        vm.$vnode
        1、最开始在 src/core/instance/render.js initRender 函数中
        const parentVnode = vm.$vnode = options._parentVnode 被设置
        描述是 父树中的占位符节点 当时是 undefined
        2、Vue.prototype._render 在 重新取了 _parentVnode 当时也是 undefined
     */
    // todo 如果 vm.$vnode 不为空 就不走 mounted 了吗？

    if( vm.$vnode == null ){
        vm._isMounted = true
        callHook(vm,'mounted')
    }else{
        //vm.$vnode 有值了
        console.log('vm.$vnode我现在有值了，难道就不走mounted了吗',vm)
    }

    return vm
}

export function initLifecycle( vm ){

    //把mergeOptions后的options赋值给options变量
    let options = vm.$options

    //
    /*
        locate first non-abstract parent
        定位第一个"非抽象"的父组件 非抽象 是啥？
        <keep-alive> 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。
        和 <transition> 相似，<keep-alive> 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在组件的父组件链中。
        这是地址：https://cn.vuejs.org/v2/api/#keep-alive
     */
    //当前vm实例有父实例parent，则赋值给parent变量。如果父实例存在，且该实例不是抽象组件。
    let parent = options.parent
    if (parent && !options.abstract) {
        //父实例parent是抽象组件，则继续找parent上的parent。
        // 直到找到非抽象组件为止。
        // 之后把当前vm实例push到定位的第一个非抽象parent的$children属性上
        while (parent.$options.abstract && parent.$parent) {
            parent = parent.$parent
        }
        parent.$children.push(vm)
    }

    // 指定已创建的实例之父实例，在两者之间建立父子关系。
    // 子实例可以用 this.$parent 访问父实例，子实例被推入父实例的 $children 数组中。
    vm.$parent = parent
    //当前组件树的根 Vue 实例。如果当前实例没有父实例，此实例将会是其自己。
    vm.$root = parent ? parent.$root : vm

    // 当前实例的直接子组件。需要注意 $children 并不保证顺序，也不是响应式的。
    vm.$children = []
    // 一个对象，持有已注册过 ref 的所有子组件。
    vm.$refs = {}

    //组件实例相应的 watcher 实例对象。
    vm._watcher = null
    //keep-alive中组件状态，如被激活，该值为false,反之为true。
    vm._inactive = null
    //keep-alive中组件状态的属性。
    vm._directInactive = false
    //当前实例是否完成挂载(对应生命周期中的mounted)。
    vm._isMounted = false
    //当前实例是否已经被销毁(对应生命周期中的destroyed)。
    vm._isDestroyed = false
    //当前实例是否正在被销毁,还没有销毁完成(介于生命周期中deforeDestroy和destroyed之间)。
    vm._isBeingDestroyed = false
}

export function callHook( vm,hook ){

    // 调用 生命周期钩子函数时 禁用 dep 收集
    // disable dep collection when invoking lifecycle hooks
    pushTarget()

    //拿到 hook 对应的 钩子函数
    //不要疑问 如果没有的话 是 undefined
    let handlers = vm.$options[ hook ]

    let info = `${hook} hook`
    if( handlers ){
        for (let i = 0,j = handlers.length; i < j ; i++) {
            invokeWithErrorHandling(handlers[i],vm,null,info)
        }
    }
    if( vm._hasHookEvent ){
        console.log('_hasHookEvent')
    }

    popTarget()
}

export function lifecycleMixin( Vue ){

    /**
     * @description 首次渲染/数据更新,_update 方法的作用是把 VNode 渲染成真实的 DOM
     * @param vnode { VNode }
     * @param hydrating { ? boolean }
     * @private
     */
    Vue.prototype._update = function (vnode,hydrating){
        let vm = this;

        // 对呀 取名 prev 不就是 上一个吗 在进来的时候 肯定还走到了这儿
        // 上一个？
        //当前 #app html
        let prevEl = vm.$el
        //undefined
        let prevVnode= vm._vnode
        // todo 下
        let restoreActiveInstance = setActiveInstance(vm)
        //在 _update 里面 _update 有值了
        vm._vnode = vnode

        // Vue.prototype.__patch__ is injected in entry points
        // based on the rendering backend used.
        // 现在还是 undefined
        if( !prevVnode ){
            //初始渲染 难道在 update 的时候 prevVnode 就有值了吗
            // vm.$el #app 的 html 内容
            console.warn('老vnode:',vm.$el)
            vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
            console.warn('新vnode：',vm.$el)
        }else{
            // 如果更新的时候 还是走这儿，这样的话 vm._node 是必定有值的
            // 因为刚在上面 将 vm._vnode 赋值了
            console.log('有值了是不是数据变动的时候还是走了_update')
        }

        restoreActiveInstance()

        // update __vue__ reference
        // 这个应该一直有值
        if( prevEl ){
            // 干什么用的
            prevEl.__vue__ = null
        }
        //一块合并不好嘛
        if (vm.$el) {
            vm.$el.__vue__ = vm
        }

        // if parent is an HOC, update its $el as well
        // 高阶组件(Higher Order Component,简称:HOC)
        if( vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode ){
            console.log('高阶组件,让我看看你长什么样子',vm)
            vm.$parent.$el = vm.$el
        }

        // updated hook is called by the scheduler to ensure that children are
        // updated in a parent's updated hook.
        // 调度程序将调用更新的挂钩，以确保在父代的更新挂钩中更新子代
    }

    /**
     * @description 迫使 Vue 实例重新渲染。注意它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件。
     */
    Vue.prototype.$forceUpdate = function (){
        console.log('------>Vue.prototype.$forceUpdate')
    }

    /**
     * @description 完全销毁一个实例。清理它与其它实例的连接，解绑它的全部指令及事件监听器。触发 beforeDestroy 和 destroyed 的钩子。
     */
    Vue.prototype.$destroy = function (){
        console.log('------>Vue.prototype.$destroy')
    }
}

//所以这个肯定还有其他地方 在用它
export let activeInstance = null
//todo 这个函数 具体的应用场景 有待考证
export function setActiveInstance( vm ){
    //一进来 activeInstance 是 null 并赋值给 prevActiveInstance
    const prevActiveInstance = activeInstance
    //重置 activeInstance 为 vm
    activeInstance = vm
    //利用闭包 将存储下
    return ()=>{
        //但还是空啊
        activeInstance = prevActiveInstance
        console.log('prevActiveInstance:',prevActiveInstance,'activeInstance:',activeInstance)
    }
}

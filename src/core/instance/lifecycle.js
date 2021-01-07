import {popTarget, pushTarget} from "../observer/dep";
import {invokeWithErrorHandling} from "../util";

//正在更新子组件
export let isUpdatingChildComponent = false

export function mountComponent( vm,el,hydrating ){

    //el 挂载到 this.$el 上
    vm.$el = el
    // if( vm.$options ){
    //     console.log('vm.$options-------->没写',vm.$options)
    // }
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
        console.log('------>Vue.prototype._update')
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

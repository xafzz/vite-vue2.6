
import {
    invokeWithErrorHandling
} from '../util'

export function mountComponent( vm,el,hydrating ){

    //el 挂载到 this.$el 上
    vm.$el = el
    // if( vm.$options ){
    //     console.log('vm.$options-------->没写',vm.$options)
    // }
}

//初始化 生命周期 初始了寂寞 啥子都没有
export function initLifecycle( vm ){

    let options = vm.$options

    // locate first non-abstract parent
    // 定位第一个非抽象父级
    // todo options 里面没有这个东东啊
    let parent = options.parent
    // 这又是啥 没有这个啊
    if( parent && !options.abstract ){
        console.log('parent && !options.abstract',parent,options.abstract)
    }

    vm.$parent = parent
    //这就是他自己被
    vm.$root = parent ? parent.$root : vm

    vm.$children = []
    vm.$refs = {}

    vm._watcher = null
    vm._inactive = null
    vm._directInactive = false
    vm._isMounted = false
    vm._isDestroyed = false
    vm._isBeingDestroyed = false
}

//todo 写到这儿又出错了 这样走是不行的 直接就是一个function,源码里面是个 object
export function callHook( vm,hook ){
    // 调用 生命周期钩子函数时 禁用 dep 收集
    // disable dep collection when invoking lifecycle hooks

    // pushTarget() //在写dep的时候 确实看到了 不知道干啥的

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

    // popTarget() //在写dep的时候 确实看到了 不知道干啥的
}

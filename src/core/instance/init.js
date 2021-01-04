
import config from '../config.js'
import { mark,measure } from '../util/perf.js'
import { mergeOptions } from '../util'
import {initProxy} from "./proxy";
import {initLifecycle,callHook} from "./lifecycle";
import {initEvents} from "./events";
import {initRender} from "./render";
import {initInjections} from "./inject";
import {initState} from "./state";

let uid = 0

export function initMixin( Vue ){
    // 终于找到你了 _init
    Vue.prototype._init = function ( options ) {
        //vm也搞到了 这就是 vue里面可以直接用vm的原因吧
        const vm = this

        vm._uid = uid++

        let startTag, endTag
        /*
            config.performance  是否记录性能
            mark
         */
        if( config.performance && mark ){
            startTag = `vue-perf-start:${vm._uid}`
            endTag = `vue-perf-end:${vm._uid}`
            mark(startTag)
        }

        //避免被观察到到一个标志
        //如果是Vue的实例，则不需要被observe todo 为什么 不需要？
        vm._isVue = true
        //合并 options
        // _isComponent 没有传啊
        if( options && options._isComponent ){
            //优化内部组件实例化
            //动态选项合并非常慢
            //内部组件选项需要特殊处理
            console.log('options._isComponent------->',options._isComponent)
        }else{
            // 这是不是拿data里面的东西啊
            // 找到你了 $options
            // 问题 resolveConstructorOptions( vm.constructor ) 是 undefined 但是 源码里面是有值的
            // 源码能注释的都注释了，是不是core/core.js 少写了什么
            //$options 包含了当前组件中所有用到生命周期，data，watch，computed以及 过滤器 组件 自定义指令
            vm.$options = mergeOptions(
                //global-api/index.js->initGlobalAPI 终于不再是undefined了
                resolveConstructorOptions( vm.constructor ),
                options || {},
                vm
            )
        }
        //非 production
        //TODO 尼玛完全不知道这是干啥子去了 就为了在Vue上加个 _renderProxy ？这是干啥用的
        //经历下面 这几个步骤 vue 多了很多属性
        initProxy(vm)
        // else vm._renderProxy = vm

        //我就是我
        vm._self = vm
        //字面意思就是 初始化生命周期
        //初始化个毛线啊 毛都没有 这里面属性就多了
        initLifecycle(vm)
        // 初始化事件 就当初始了毛线 _events、_hasHookEvent
        initEvents(vm)
        //初始化 render
        initRender(vm)
        //这个函数不知道干啥的 不过 beforeCreate 就很熟了
        //
        /*
            对options的处理有问题 直接就是一个function,源码里面是个 object？ 找到原因了
            mergeOptions 合并的时候 出问题了
            详见 src/core/util/options.js
         */
        // 调用 call/apply
        callHook(vm,'beforeCreate')
        //暂时没有这块
        // initInjections(vm)
        //props/methods/data/computed
        //
        // initState(vm)
        // callHook(vm,'created')


        //为什么要加这一句呢
        /*
            写法一：
            const app = new Vue({
                render:h=>h(App)
            })
            app.$mount("#app")
            写法二:
            new Vue({
                el:'#app',
                components:{ App }
            })

            有这么2种写法
            写法一直接 挂载到了 $mount 上，写法二没有直接 $mount ，所以 需要单独在执行下
            问题：
            写法一目前 vm.$options 上 vm.$options.el = undefined
         */
        if( vm.$options.el ){
            vm.$mount(vm.$options.el)
        }
    }
}

export function resolveConstructorOptions( Ctor ){
    let options = Ctor.options
    //首先需要判断该类是否是Vue的子类
    if( Ctor.super ){

        console.log('options-------->',options,'Ctor.super---------->',Ctor.super)
    }
    return options
}

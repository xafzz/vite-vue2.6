
import config from '../config.js'
import { mark,measure } from '../util/perf.js'
import { mergeOptions } from '../util/index.js'
import {initProxy} from "./proxy";
import {initLifecycle} from "./lifecycle";
import {initEvents} from "./events";
import {initRender} from "./render";

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

        {
            //Vue实例的_renderProxy属性赋值
            //vue 上 挂载 _renderProxy
            //todo _renderProxy 干什么用的？
            //测试环境
            initProxy( vm )
            //生产环境 vm._renderProxy = vm
        }

        vm._self = vm
        //初始化生命周期
        //vue实例一些属性进行赋值
        initLifecycle(vm)
        //初始化事件相关
        //父组件绑定在当前组件上的事件
        initEvents(vm)
        //initRender 初始化 render 函数
        initRender(vm)



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

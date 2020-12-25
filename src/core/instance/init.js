
import config from '../config.js'
import { mark,measure } from '../util/perf.js'
import { mergeOptions } from '../util/index.js'

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
            //找到你了 $options
            vm.$options = mergeOptions(
                resolveConstructorOptions( vm.constructor ),
                options || {},
                vm
            )
            console.log('vm.$options----->',vm.$options,resolveConstructorOptions( vm.constructor ))
            console.log('vm.constructor----->',vm.constructor)
        }

    }
}

export function resolveConstructorOptions( Ctor ){
    //undefined
    let options = Ctor.options
    if( Ctor.super ){

        console.log('options-------->',options,'Ctor.super---------->',Ctor.super)
    }
    return options
}
import config from "../config.js";
import {ASSET_TYPES} from "../../shared/constants.js";
import {
    extend,  //shared/util
    mergeOptions
} from '../util'

export function initGlobalAPI( Vue ){

    let configDef = {}
    configDef.get = () => config
    configDef.set = () => {
        //Do not replace the Vue.config object, set individual fields instead.
        console.warn('不要更改Vue.config文件对象')
    }
    //添加config属性 无敌的只读属性 就不要尝试修改了
    Object.defineProperty(Vue,'config',configDef)


    // exposed util methods.
    // 公开的 util 方法
    // NOTE: these are not considered part of the public API - avoid relying on
    // them unless you are aware of the risk.
    //todo 留着后面写
    Vue.util = {
        // warn //没有warn 直接用 console.warn 表示
        extend, //shared/util 混入传入的数组中
        mergeOptions,  //合并options initMixin 用到了
        // defineReactive //todo 好熟悉，这不是 observer 将数据处理成响应式数据(仅限object)，现在先不写数据处理这块
    }

    //不是空的了
    //constructor
    //没有 options resolveConstructorOptions( vm.constructor ) 一直是undefined
    Vue.options = Object.create(null)
    /**
     ASSET_TYPES = [
         'component',   组件
         'directive',   指令
         'filter'       过滤器
     ]
     */
    ASSET_TYPES.forEach( val=>{
        Vue.options[val+'s'] = Object.create(null)
    } )

    // this is used to identify the "base" constructor to extend all plain-object
    // components with in Weex's multi-instance scenarios.
    // src/core/util/options.js
    // extends mixins
    Vue.options._base = Vue

    //将 builtInComponents 的属性混合到 Vue.options.components 中，
    //KeepAlive
    // extend(Vue.options.components, builtInComponents)
    //
    //Vue 构造函数上添加 use 方法，传说中的Vue.use() 安装vue插件
    // initUse(Vue)

    //添加 mixin 这个全局的API
    // initMixin(Vue)

    //添加 Vue.cid 静态属性
    //添加Vue.extend 静态方法
    // initExtend(Vue)

    //经过 initAssetRegisters 方法，Vue 又多了三个静态方法：
    // initAssetRegisters(Vue)
}

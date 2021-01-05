import config from "../config.js";
import {ASSET_TYPES} from "../../shared/constants.js";
import {
    extend,  //shared/util
    mergeOptions, nextTick,defineReactive
} from '../util'
import {del, observe, set} from "../observer/observe";
import {initUse} from "./use";
import {initMixin} from "./mixin";
import {initExtend} from "./extend";
import {initAssetRegisters} from "./assets";

export function initGlobalAPI( Vue ){

    let configDef = {}
    configDef.get = () => config
    {
        configDef.set = () => {
            //Do not replace the Vue.config object, set individual fields instead.
            console.warn('不要更改Vue.config文件对象')
        }
    }
    //添加config属性 无敌的只读属性 就不要尝试修改了
    Object.defineProperty(Vue,'config',configDef)


    // exposed util methods.
    // 公开的 util 方法
    // NOTE: these are not considered part of the public API - avoid relying on
    // them unless you are aware of the risk.
    Vue.util = {
        // warn //没有warn 直接用 console.warn 表示
        extend, //shared/util 混入传入的数组中
        mergeOptions,  //合并options initMixin 用到了
        defineReactive //这不是 observer 将数据处理成响应式数据
    }

    // todo 没有实现 $set $delete $nextTick
    Vue.set = set
    Vue.delete = del
    Vue.nextTick = nextTick

    Vue.observable = function (obj){
        console.log('走到这儿了吗，obj是啥',obj)
        observe(obj)
        return obj
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

    //在Weex的多实例场景中，它用于标识“基本”构造函数以扩展所有纯对象组件
    // src/core/util/options.js
    // extends mixins
    // 都放到 options 的 _base 里面
    Vue.options._base = Vue

    //将 builtInComponents 的属性混合到 Vue.options.components 中，
    //KeepAlive
    // extend(Vue.options.components, builtInComponents)
    //
    //Vue 构造函数上添加 use 方法，传说中的Vue.use() 安装vue插件
    initUse(Vue)

    //添加 mixin 这个全局的API
    //其实就是一个合并 options 过程 mergeOptions
    initMixin(Vue)

    //添加 Vue.cid 静态属性
    //类继承
    initExtend(Vue)

    //经过 initAssetRegisters 方法，Vue 又多了三个静态方法：'component',   'directive',   'filter'
    initAssetRegisters(Vue)
}


import Vue from './instance/instance.js'
import { initGlobalAPI } from './global-api/index.js'
import { isServerRendering } from './util/env.js'


//GlobalAPI
// 将 Vue 构造函数作为参数，传递给 initGlobalAPI 方法
// 全局API以静态属性和方法的形式被添加到 Vue 构造函数
// 这个还是的先写，要不后面mergeOptions缺点啥
initGlobalAPI(Vue)

// todo 关于ssr相关的没有写
Object.defineProperty(Vue.prototype,'$isServer',{
    get:isServerRendering
})


//嘿嘿
//储存当前vue版本
Vue.version = '__XAFZZ__'

export default Vue

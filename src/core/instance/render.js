
import { resolveSlots } from './render-helpers/resolve-slots'
import {emptyObject} from "../../shared/util";
import { createElement } from '../vdom/create-element'

export function initRender( vm ){

   //vnode 感觉好像接触到了什么
   // 难道要跟 compile 生成的 render 函数对接
   vm._vnode = null // the root of the child tree
   // 这个 看起来就像是 用了 v-once 以后 staticRenderFns
   vm._staticTrees = null  // v-once cached trees

   let options = vm.$options
   let parentVnode = vm.$vnode = options._parentVnode
   let renderContenxt = parentVnode && parentVnode.context
   vm.$slots = resolveSlots(options._renderChildren,renderContenxt)
   vm.$scopedSlots = emptyObject


   // bind the createElement fn to this instance
   // so that we get proper render context inside it.
   // args order: tag, data, children, normalizationType, alwaysNormalize
   // internal version is used by render functions compiled from templates
   //将createElement fn绑定到该实例，
   // 以便我们在其中获得适当的渲染上下文。
   // args顺序：标记，数据，子代，normalizationType，
   // alwaysNormalize内部版本由模板编译的渲染函数使用
   //渲染的时候 好像就是用这个吧 里面还很复杂 不过 _c 也出来 就是 createElement
   //todo 后面先去写吧 这就是一个初始化
   vm._c = (a,b,c,d) => createElement(vm,a,b,c,d,false)
   // normalization is always applied for the public version, used in
   // user-written render functions.
   vm.$createElement = (a,b,c,d) => createElement(vm, a, b, c, d, true)


   // $attrs & $listeners are exposed for easier HOC creation.
   // they need to be reactive so that HOCs using them are always updated
   //undefined
   let parentData = parentVnode && parentVnode.data

   //todo 这个记一下，单独写 defineReactive 的补上

}

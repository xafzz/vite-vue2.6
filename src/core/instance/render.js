
import {resolveSlots} from "./render-helpers/resolve-slots";
import {emptyObject} from "../../shared/util";
import {createElement} from "../vdom/create-element";
import {defineReactive} from "../observer/observe";
import {isUpdatingChildComponent} from "./lifecycle";


export function initRender( vm ){
    // the root of the child tree
    vm._vnode = null
    // v-once cached trees
    vm._staticTrees = null

    const options = vm.$options
    // the placeholder node in parent tree
    const parentVnode = vm.$vnode = options._parentVnode
    const renderContext = parentVnode && parentVnode.context

    // 组件之slot插槽
    vm.$slots = resolveSlots(options._renderChildren, renderContext)
    vm.$scopedSlots = emptyObject

    // $createElement方法的主要作用是解析用户写的模板html，从而成为浏览器可以识别的格式。
    // 将 createElement 方法绑定到这个实例，这样我们就可以在其中得到适当的 render context。
    // todo createElement() 方法的最后一个参数 是来判断是 开发者是否在调用vue的时候 使用了 render 函数
    vm._c = (a,b,c,d) => createElement(vm,a,b,c,d,false)
    // normalization is always applied for the public version, used in
    // user-written render functions.
    vm.$createElement = (a,b,c,d) => createElement(vm, a, b, c, d, true)

    // $attrs & $listeners are exposed for easier HOC creation.
    // they need to be reactive so that HOCs using them are always updated
    //undefined
    let parentData = parentVnode && parentVnode.data

    {
        defineReactive(vm,'$attr', parentData && parentData.attrs || emptyObject,()=>{
            !isUpdatingChildComponent && console.warn('$attr is readonly')
        },true)

        defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
            !isUpdatingChildComponent && console.warn(`$listeners is readonly.`, vm)
        }, true)
    }
}

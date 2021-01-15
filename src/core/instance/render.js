
import {resolveSlots} from "./render-helpers/resolve-slots";
import {emptyObject} from "../../shared/util";
import {createElement} from "../vdom/create-element";
import {defineReactive} from "../observer/observe";
import {isUpdatingChildComponent} from "./lifecycle";
import {installRenderHelpers} from "./render-helpers";
import {createEmptyVNode, VNode} from "../vdom/vnode";


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
    // createElement() 方法的最后一个参数 是来判断是 开发者是否在调用vue的时候 使用了 render 函数
    // todo false 这2种模式有什么不一样
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

//当前渲染组件的实例
export let currentRenderingInstance = null

export function renderMixin( Vue ){

    // install runtime convenience helpers
    // 原型上邦了这么多东西
    installRenderHelpers(Vue.prototype)

    /**
     * @description 将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。它跟全局方法 Vue.nextTick 一样，不同的是回调的 this 自动绑定到调用它的实例上。
     * @param fn
     */
    Vue.prototype.$nextTick = function (fn){
        console.log('-------->Vue.prototype.$nextTick')
    }

    /**
     *
     * @private
     */
    Vue.prototype._render = function (){
        let vm = this
        //render 就是之前生成到 render 函数
        //_parentVnode undefined
        let { render,_parentVnode } = vm.$options

        if(_parentVnode){
            console.log('_parentVnode不为空？',_parentVnode)
        }

        // 设置父vnode。这使渲染功能可以访问占位符节点上的数据。
        // 没有值 也是 undefined
        // 有值到时候 到时候 再来看看
        vm.$vnode = _parentVnode
        // render self 这么渲染到
        let vnode
        try {
            // 无需维护堆栈，因为所有渲染fns都彼此分开调用。
            // 修补父组件时，将调用嵌套组件的渲染fns。
            // 当前渲染的组件实例 就是 他自己
            currentRenderingInstance = vm
            // TODO 不明白具体怎么运作的
            vnode = render.call(vm._renderProxy,vm.$createElement)
        }catch (e) {
            console.error('有错误:',e)
        }finally {
            //感情这是用完了就扔掉被
            currentRenderingInstance = null
        }

        // if the returned array contains only a single node, allow it
        // return 只包含一个 节点
        if( Array.isArray(vnode) && vnode.length === 1 ){
            console.log('首先也的是一个数组啊,你到底啥时候是个数组,',vnode)
        }

        // return empty vnode in case the render function errored out
        // 关于 instanceof
        // src/core/instance/instance.js 在里面查看吧
        if( !(vnode instanceof VNode) ){
            if( Array.isArray(vnode)) {
                console.warn(
                    'Multiple root nodes returned from render function. Render function ' +
                    'should return a single root node.'
                )
            }
            vnode = createEmptyVNode()
        }
        // set parent
        // 难道要父子组件 才会有值？
        // undefined
        if( _parentVnode ){
            console.log('_parentVnode有值了，',_parentVnode)
        }
        vnode.parent = _parentVnode
        return vnode
    }
}

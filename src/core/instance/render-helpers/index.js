import {toNumber, toString} from "../../../shared/util";
import {createEmptyVNode, createTextVNode} from "../../vdom/vnode";
import {renderList} from "./render-list";
import {renderStatic} from "./render-static";


//这个函数越写越感觉就是一个替换的作用
//将 generate 生成的代码,在这儿过滤一遍，将 _v _e _l 替换指定的函数 并生成对应的 vnode
export function installRenderHelpers( target ){

    //将输入值转换为数字以保持持久性。如果转换失败，则返回原始字符串
    // target._n = toNumber

    // ...
    //创建文本节点
    //将文本节点 放到 VNode 中的 text
    //VNode {tag: undefined, data: undefined, children: undefined, text: " 点击 ", elm: undefined,…}
    target._v = createTextVNode
    //创建空节点
    // 创建注释节点 isCommit = true 注释内容 在 text 里面
    // VNode {tag: undefined, data: undefined, children: undefined, text: " 这是一段注释 ", elm: undefined, …}
    target._e = createEmptyVNode
    //再去看 generate 里面的生成 _l 的这段就好理解了
    //todo ret 怎么是 undefined 不应该啊
    //从这走了很多地方 因为里面有watcher
    //v-for相关的
    // 将函数拆解来 没有生成 vnode
    target._l = renderList
    //将值转换为实际呈现的字符串。
    target._s = toString
    //静态节点
    // 我们把 v-once 当作是静态节点
    // 生成 render 函数的时候 将静态的节点 存放到 staticRenderFns
    // 在 render 函数中 用 _m(0),_m(1),_m(2)方式替代
    // 取值的时候 应该就是 vm.$options.staticRenderFns 拿到对应的 key 取到相应的 值
    //没有生成vnode
    target._m = renderStatic
}

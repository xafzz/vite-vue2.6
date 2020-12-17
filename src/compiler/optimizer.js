//优化器
/**
 * 官方注释
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 *
 * 这是一个优化器
 * 遍历生成的AST并检测纯静态的子树
 * 检测到将他们提升为常量 这样每次渲染的时候 就不需要创建新的节点
 * patching的时候完全跳过它们
 */

import {
    cached,
    makeMap
} from "./helpers.js";

import {
    no  //无论如何都是返回false
}  from '../shared/util.js'

//静态标示key，平台保留的标签
let isStaticKey,isPlatformReservedTag
//创建缓存
let getStaticKeysCached = cached(genStaticKeys)

let isBuiltInTag = makeMap('slot,component',true)

export default function optimize(root,options) {
    if( !root ){
        return
    }
    //返回了 函数
    isStaticKey = getStaticKeysCached(options.staticKeys || '')
    isPlatformReservedTag = options.isReservedTag || no
    //我去 这比生成 ast 简单多了 就2步
    // first pass: mark all non-static nodes.
    // 第一步标记所有 非静态节点
    markStatic(root)
    // second pass: mark static roots.
    // 第二步 标记 静态 根
    markStaticRoots(root,false)
}
//通用静态健
//仔细一看 这不就是 ast里面的各个属性嘛
function genStaticKeys(keys){
    return makeMap(
        'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
        (keys ? ',' + keys : '')
    )
}
//第一步 标记所有非静态节点
function markStatic(node){
    console.log(node)
    node.static = isStatic(node)
    //节点
    if( node.type === 1 ){
        /**
         *  do not make component slot content static. this avoids
         *  不要将组件插槽内容设为静态。这样可以避免
         *  1. components not able to mutate slot nodes
         *  组件无法改变插槽节点
         *  2. static slot content fails for hot-reloading
         *  静态插槽内容无法进行热重新加载
         */
        //我勒个去 走到这 直接走不下去了
        if(
            !isPlatformReservedTag(node.tag) &&
            node.tag !== 'slot' &&
            node.attrsMap['inline-template'] == null
        ){
            return
        }
        console.log(111)
    }
}

//第二步 标记静态 根
function markStaticRoots(node,isInFor){
    //只有是节点的时候
    if( node.type === 1 ){

    }
    console.log(node,isInFor)
}

//从生成 ast 的过程 延伸过来 这块就相对好理解了
function isStatic(node){
    console.log(node.type)
    //表达式  当时动态的时候 node.expression _s(xx)
    if( node.type === 2){
        return false
    }
    // 文本了
    if( node.type === 3 ){
        return true
    }
    /**
     * node.pre    v-pre
     * node.hasBindings   在processAttrs函数中标记各个属性的时候的 @ v- 都是动态属性
     * node.if  v-if
     * node.for v-for
     * isBuiltInTag(node.tag)  标签是否是 slot 或者 component
     * isPlatformReservedTag(node.tag)   不是 component
     * Object.keys(node).every(isStaticKey)
     */
    return !! (
        node.pre || (
            !node.hasBindings &&  //没有动态
            !node.if && !node.for && //不是 v-if v-for or v-else
            !isBuiltInTag(node.tag) &&  // not a built-in
            isPlatformReservedTag(node.tag) && // not a component
            !isDirectChildOfTemplateFor(node.tag) &&
            Object.keys(node).every(isStaticKey)
        )
    )
}

function isDirectChildOfTemplateFor(node){
    //第一层的是 parent 是 undefined
    while (node.parent){

        console.log('没有进来啊 什么情况')
    }
    return false
}

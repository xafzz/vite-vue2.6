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
    // 只处理节点
    markStaticRoots(root,false)
    console.log(root)
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
        //options 应该搞搞 要不进行不下去
        //添加了options的isReservedTag 又可以继续了
        if(
            !isPlatformReservedTag(node.tag) &&
            node.tag !== 'slot' &&
            node.attrsMap['inline-template'] == null
        ){
            return
        }

        //递归的形式 获取每个节点 并打上标记
        for( let i=0,l=node.children.length;i<l;i++ ){
            let child = node.children[i]
            markStatic(child)
            if( !child.static ){
                node.static = false
            }
        }
        //节点上是否有if
        //递归 下面的元素
        //晕了 有到processIf里面去了 无限循环了

        if( node.ifConditions ){
            //这里面也是通过 parse 加上的
            //误会了 这里i默认值是1
            for( let i = 1,len=node.ifConditions.length;i<len;i++ ){
                let block = node.ifConditions[i].block
                //前面代码 导致这有个无限循环 是因为写成了 i=0
                markStatic(block)
                if( !block.static ){
                    node.static = false
                }
            }
        }
    }
}

//第二步 标记静态 根
function markStaticRoots(node,isInFor){
    //只有是节点的时候
    if( node.type === 1 ){
        if( node.static || node.once ){
            node.staticInFor = isInFor
        }
        // For a node to qualify as a static root, it should have children that
        // 使节点符合静态根，它应该具有
        // are not just static text. Otherwise the cost of hoisting out will
        // 不仅仅是静态文本
        // outweigh the benefits and it's better off to just always render it fresh.
        // 静态节点 存在子元素
        if( node.static && node.children.length && !(node.children.length === 1 && node.children[0].type === 3) ){
            node.staticRoot = true
            return
        }else{
            node.staticRoot = false
        }

        //todo 可能是因为没有 options的原因
        if( node.children ){
            for( let i=0,l=node.children.length; i < l ; i++ ){
                let child = node.children[i]
                markStaticRoots(child,isInFor || !!node.for)
            }
        }
        // 有if 的情况
        if( node.ifConditions ){
            for( let i = 1,l = node.ifConditions.length; i<l;i++ ){
                let child = node.ifConditions[i].block
                markStaticRoots(child,isInFor)
            }
        }
    }
}

//从生成 ast 的过程 延伸过来 这块就相对好理解了
function isStatic(node){
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

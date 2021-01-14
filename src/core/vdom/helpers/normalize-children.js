
import {isDef, isFalse, isPrimitive, isTrue, isUndef, no} from "../../../shared/util";
import {createTextVNode} from "../vnode";

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.

// 模板编译器试图通过在编译时静态分析模板来最大程度地减少标准化需求。
// 对于纯HTML标记，可以完全跳过规范化，
// 因为可以保证生成的渲染函数返回Array <VNode>。
// 在两种情况下，需要额外的规范化：

// 1.当子代包含组件时-因为功能组件可能会返回Array而不是单个根。
// 在这种情况下，只需要简单的规范化-如果任何子级是Array，
// 我们将使用Array.prototype.concat将整个内容弄平。
// 由于功能组件已经规范了自己的子组件，因此保证只有1级深度。

export function simpleNormalizeChildren(children ){
    console.log('this is simpleNormalizeChildren')
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
// 2.当子级包含始终生成嵌套数组的构造时，
// 例如<template>，<slot>，v-for或用户为子代提供手写渲染功能JSX时。
// 在这种情况下，需要完全规范化以适应所有可能类型的子代值。

export function normalizeChildren( children ){
    //children 的类型 不为空的常规类型 string number
    if( isPrimitive(children) ){
        //创建一个 文本 vnode 返回的是一个数组
        return [ createTextVNode(children) ]
    }else{
        if( Array.isArray(children) ){
            return normalizeArrayChildren(children)
        }else{
            return undefined
        }
    }
}

/**
 *
 * @param children compile 生成的整个 js dom 树
 * @param nestedIndex { ?string }
 */
function normalizeArrayChildren( children,nestedIndex ){
    let res = []
    let i, c, lastIndex, last
    for (i = 0; i < children.length; i++) {
        /*
            每个节点的 对应的 vnode 但只是第一级结构 并不是 所有的
            <template>
                <!-- 这是一段注释,这是下面2加上的 1的时候咩有 -->
                <div id="main" title="1" class="main" style="background: red;border: 1px solid red;" >
                    <div class="center" v-for="(item,key) in 10" :key="key">
                        <p>{{ msg }},{{ changeComputed }},{{computedParams(2)}},item:{{item}},key:{{key}}</p>
                    </div>
                    <div class="bottom">
                        <a href="/" target="_blank" :title="msg" id="link" class="link" :class="cla" name="a">第三方的身份</a>
                    </div>
                </div>
            </template>
            children.length
            1、 算上 换行 长度是 4
            2、如果加上注释 长度是 6
            如果在 编译过程中 开启了 options.whitespace = 'condense' 压缩模式
            那么他们对应的长度 都要除以2
         */
        c = children[i]

        if( isUndef(c) || typeof c === 'boolean' ){
            //存在有节点 但是 没有任何返回的情况下就是走这儿
            //在 src/core/instance/render-helpers/render-static.js 时候 无意将所以代码删了 结果这爆出来了
            //在 静态节点 没有任何返回的时候 是一个空的 undefined
            // console.log('让我看看这时候c是什么样子的',c)
            // c 是 undefined
            continue
        }
        // -1
        lastIndex = res.length - 1
        // undefined
        last = res[lastIndex]

        if( Array.isArray(c) ){         //数组的时候
            /*
                正好用v-for
                <div class="center" v-for="(item,key) in 10" :key="key">
                    <p>{{ msg }},{{ changeComputed }},{{computedParams(2)}},item:{{item}},key:{{key}}</p>
                </div>
                每循环一次生成一个 vnode push到一个数组里面
                /src/core/instance/render-helpers/render-list.js renderList
             */
            //将数组里面的内容 递归出来
            c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)
            // merge adjacent text nodes
            if( isTextNode(c[0]) && isTextNode(last)){
                console.log('没有进来')
            }
            res.push.apply(res,c)
        }else if( isPrimitive(c) ){     //常规字符串的时候
            console.log('children 是个字符串,',c)
        }else{                          //其他情况 object
            if (isTextNode(c) && isTextNode(last)) {
                //继续合并相邻的文本节点
                //在 src/core/instance/render-helpers/render-static.js 时候 无意将所以代码删了 结果这爆出来了
                //在 静态节点 没有任何返回的时候 c是undefined
                //没有开启压缩模式 换行也是空的 所以这儿要合并下
                //但是 我在开启了 compile 压缩模式的 不存在2个相同的空vnode 没有走这儿
                res[lastIndex] = createTextVNode(last.text + c.text)
            }else{
                // 嵌套数组子级的默认键（可能由v-for生成）
                // /src/core/instance/render-helpers/render-list.js
                // 对 v-for 处理的时 添加了 _isVlist 标示
                //todo v-for 循环 但是没有 key 设置 key 的时候 要给他设置上一个 为了什么？
                if(
                    isTrue(children._isVlist) &&
                    isDef(c.tag) &&
                    isUndef(c.key) &&
                    isDef(nestedIndex) //上面将递归的时候将 nestedIndex 传值了
                ){
                    c.key = `__vlist${nestedIndex}_${i}__`
                }

                res.push(c)
            }
        }

    }
    return res
}

function isTextNode(node){
    return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

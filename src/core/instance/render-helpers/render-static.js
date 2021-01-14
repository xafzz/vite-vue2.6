

/**
 * Runtime helper for rendering static trees.
 */
export function renderStatic(index,isInFor){

    // _staticTrees 在 initRender 设置了 null 那个时候 还没有
    // 初始化渲染的时候 还是空
    let cached = this._staticTrees || (this._staticTrees=[])
    let tree = cached[index]

    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree.
    //如果已经渲染了静态树并且不在v-for内部，则可以重用同一棵树。
    if (tree && !isInFor) {
        console.log('还没有 tree,更新的时候才会有吗',tree)
    }
    // otherwise, render a fresh tree.
    // 否则渲染一颗新的树
    // undefined 啊 是因为没写 createElement 这个的原因吗
    tree = cached[index] = this.$options.staticRenderFns[index].call(
        this._renderProxy,
        null,
        this  //用于为功能组件模板生成的渲染fns
    )
    //有tree 的时候 在来看看

    // 完成了 createElement 这儿也有值了
    // 打上标记
    markStatic(tree,`__static__${index}`,false)

    return tree
}

function markStatic( tree,key,isOnce ){
    if( Array.isArray(tree) ){
        console.log('这棵树终于是个array了,',tree)
    }else{
        //创建静态节点
        markStaticNode(tree,key,isOnce)
    }
}

function markStaticNode(node,key,isOnce){
    node.isStatic = true
    node.key = key
    node.isOnce = isOnce
}

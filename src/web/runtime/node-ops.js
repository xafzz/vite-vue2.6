





export function createElement(tagName,vnode){
    //创建一个空的 html标签
    //<div></div>
    const elm = document.createElement(tagName)
    if( tagName !== 'select' ){
        return elm
    }
    console.log('tagName是select')
}

// 指定的已有子节点之前插入新的子节点
export function insertBefore(parentNode,newNode,referenceNode){
    parentNode.insertBefore(newNode, referenceNode)
}

//向节点添加最后一个子节点
export function appendChild(node,child){
    node.appendChild(child)
}

//创建注释节点
export function createComment (text) {
    return document.createComment(text)
}

//创建文本节点
export function createTextNode (text) {
    return document.createTextNode(text)
}

//获取当前元素的 父级元素  <body><div id="app">
// 就是 body
export function parentNode(node){
    return node.parentNode
}

//nextSibling 属性返回指定节点之后紧跟的节点，在相同的树层级中。
export function nextSibling(node){
    return node.nextSibling
}

//获取 元素的 名字 但是大写 需要转成小写 toLowerCase()
export function tagName(node){
    //取出来的是大写的DIV
    return node.tagName
}

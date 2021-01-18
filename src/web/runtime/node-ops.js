







//获取当前元素的 父级元素  <body><div id="app">
// 就是 body
export function parentNode(node){
    return node.parentNode
}

//获取 元素的 名字 但是大写 需要转成小写 toLowerCase()
export function tagName(node){
    //取出来的是大写的DIV
    return node.tagName
}

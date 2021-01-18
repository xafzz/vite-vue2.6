# patch

    patch 阶段    

======================  18.1  ======================
## patch-patch
###### 详细注释可以在代码中查看
###### 相应目录修改

    文件：src/core/vdom/patch.js
    在 createPatchFunction 函数中 return patch()

### isRealElement
###### 初次渲染时为真，有nodeType

    nodeType 
        https://www.runoob.com/jsref/prop-node-nodetype.html


### sameVnode
###### 当oldVnode跟vnode都是 vnode 时或者 在 update 的时候

    1、input：

        1)、data 

            {
                attrs: {type: "text", id: "input", name: "input", value: "这是默认值"}
                model: {value: 1, expression: "msg", callback: ƒ}
                on: {click: ƒ}
            }

        2)、attrs

            {type: "text", id: "input", name: "input", value: "这是默认值"}

        3)、type

            makeMap('text,number,password,search,email,tel,url')

    2、非 input：
        1)、key 常见在 v-for 时，没有时 undefined
        2)、tag 标签名字
        3)、isComment
        4)、data 
            
            {
                attrs: {id: "main", title: "1"}
                staticClass: "main"
            }

        5)、isAsyncPlaceholder、asyncFactory

            这块都在 VNode 类中
            // async component factory function
            //异步工厂方法
            this.asyncFactory = asyncFactory
            // 是否为异步占位
            this.isAsyncPlaceholder = false

======================  18.2  ======================

## emptyNodeAt

    初次渲染的时候，oldVnode 是html结构，拿到当前元素创建一个空的vnode

### 问题
#### parentElm

    获取父级不知道要干什么


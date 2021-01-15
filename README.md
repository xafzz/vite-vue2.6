# mountComponent-runtime-mount
###### 残留的问题不少，还有待解决

    mountComponent 过程已经写完了，由上至下依次是执行的过程,对应的分支依次是17.1-17.9

### 功能
    
    1、创建 beforeMount 钩子函数
    2、_render 函数生成 vnode
    3、installRenderHelpers 解析 compile阶段 generate 函数生成的 _v _s _m
    4、createElement,_createElement _c 函数
    5、_update 引出 patch(在这还没有实现)
    6、创建 mounted 钩子函数

======================  17.1  ======================

## mountComponent-runtime-mount

    文件：src/core/instance/lifecycle.js
    let vnode = vm._render() 是 undefined
    需要到 src/core/instance/render.js 完善 _render() 函数

======================  17.2  ======================

## _render-runtime-mount

    文件：src/core/instance/render.js
    renderMixin 函数里面的 Vue.prototype._render
    vnode = render.call(vm._renderProxy,vm.$createElement)
    分成两部分 vm._renderProxy、vm.$createElement

### 问题

#### 1、vm._renderProxy

    文件：src/core/instance/proxy.js
    当初在写 initProxy 时候 不明白 hasHandler 这个要在什么时候使用以及他的作用
    作用：
        has( target,key ) 检查 vm 上是否有 render 函数里面函数比如： _v _c _m
        有返回 true 没有 返回 false

#### 1.1、render:95 有错误: TypeError: Cannot read property '_data' of undefined
    文件：src/core/instance/state.js
    dataDef.get = () => this._data 当时这地方做了备注 箭头函数可能会出问题，果然出问题了
    修改如下：
        dataDef.get = function(){
            return this._data
        }
    拿到 _data 


#### 2、vm.$createElement

    文件：src/core/instance/proxy.js
    在 initRender， vm.$createElement = (a,b,c,d) => createElement(vm, a, b, c, d, true)
    执行 createElement 函数

#### 3、_v、_m is not defined

    为什么报这个错？
    这个是从 renderMixin 里面 installRenderHelpers 报错出来的
    当时候写的时候 installRenderHelpers 这个函数也不知道有什么用

======================  17.3  ======================

## installRenderHelpers-runtime-mount
###### 给我的感觉就是替换 generate 生成的render函数里面 _v _m _s ，_c 就是 creatElement
###### 详细的注释可在代码里面查看

    文件：src/core/instance/render.js
    renderMixin 函数里面的 installRenderHelpers
    在 src/core/instance/render-helpers/index.js
    从这引出 src/core/vdom/create-element.js 里面的 createElement

#### 1、target._v = createTextVNode

    创建文本节点，直接生成对应的 vnode
    将文本节点 放到 VNode 中的 text
    VNode {tag: undefined, data: undefined, children: undefined, text: " 点击 ", elm: undefined,…}

#### 2、target._e = createEmptyVNode

    创建空节点，直接生成对应的 vnode
    创建注释节点 isCommit = true 注释内容 在 text 里面
    VNode {tag: undefined, data: undefined, children: undefined, text: " 这是一段注释 ", elm: undefined, …}

#### 3、target._l = renderList

    文件位置：src/core/instance/render-helpers/render-list.js
    _l 是 generate 的时候 v-for 生成的，这儿把 vfor 对应的节点
    内部用一个 for 循环 将对应的节点 循环 

#### 4、target._s = toString

    将值转换为实际呈现的字符串。

#### 5、target._m = renderStatic

    文件位置：src/core/instance/render-helpers/render-static.js
    _m 是 generate 对应的 v-once 节点 直接从 staticRenderFns
    _m(0)、_m(1)、_m(2) 对应的就是 staticRenderFns 里面的 key

### 问题

#### 1、TypeError: watcher.evaluate is not a function

    watcher里面少一个函数 evaluate
    报错位置：src/core/instance/state.js里面的 computedGetter

#### 2、TypeError: watcher.depend is not a function

    watcher里面少一个函数 depend
    报错位置：src/core/instance/state.js里面的 computedGetter

======================  17.4  ======================

## createElement-runtime-mount
###### 函数不大，注释不少都在代码里了，把generate也看了一下
###### dom 生成的 _c _v 都在注释对齐了

    函数本身不大，主要作用是将各个参数对齐
    因为对于没有任何属性的标签，参数 data 就没有了，但是 children 顶替了 data 的位置
    所以 这个函数的的作用就是 将各个参数本来表示的意思 重新表示下
    <div></div>对于这样的标签 除了 tag 以外都是 undefined

>alwaysNormalize的问题 true/false

    对应2中模式
    const SIMPLE_NORMALIZE = 1
    const ALWAYS_NORMALIZE = 2
    只能以后慢慢体会了

======================  17.5  ======================

## _createElement-runtime-mount
###### 第一遍出问题了虽然解决了全删了代码这算是第二版吧，注释可能较第一版少了

    文件：src/core/vdom/create-element.js 里面的 _createElement

### normalizeChildren

    文件：src/core/vdom/helpers/normalize-children.js

###### 我们生成的js，DOM是按照dom的结构形式表现出来的
###### 这块需要先完成后面的代码，return过一个vnode以后才行，要不然全是undefined
    1、将结构打平，通过递归的方式
    2、检测在使用v-for的时候 是否设置 key 如果没有的话，系统添加上 key
        `__vlist${nestedIndex}_${i}__`

### 总结
###### 完成了_createElement 前几步又可以继续进行(完善)

    验证部分省略了，可以看代码

>2个模式
>
    1、compile时options.whitespace = 'condense'
    2、createElement时，SIMPLE_NORMALIZE、ALWAYS_NORMALIZE
       关于这2种 src/core/vdom/create-element.js 有详细的说明


### 问题
#### 1、!('@binding' in data.key)

    位置：/src/core/vdom/create-element.js 中的 _createElement
    @binding 什么意思？

#### 2、在compile过程的时候提到了 options.whitespace = 'condense' 压缩模式

    在生成 vnode 的时候 也是会有影响的

======================  17.6  ======================

## renderStatic-installRenderHelpers-runtime-mount

### 补坑
###### 完善了 _createElement

#### 1、renderStatic

    文件：src/core/instance/render-helpers/render-static.js
    给静态vnode 打上属于静态的标记
    node.isStatic = true
    node.key = key
    node.isOnce = isOnce

#### 2、normalizeArrayChildren

    文件：src/core/vdom/helpers/normalize-children.js
    1、if( isUndef(c) || typeof c === 'boolean' ) c 是 undefined 没有任何返回的时候 进去了
    2、if (isTextNode(c) && isTextNode(last))
        只有在编译的时候 没有开启 压缩模式 options.whitespace = 'condense' 才会走到这
        如果开启了压缩模式 目前不会走到这儿

======================  17.7  ======================

## _render-runtime-mount
###### 跟17.2其实是一个函数,但是在17.2的时候没有写完

    文件：src/core/instance/render.js
    renderMixin 函数里面的 Vue.prototype._render

### 补坑

    补齐剩下的代码，return vnode
    src/core/instance/lifecycle.js 里面的 mountComponent 又可以继续进行了

### 问题
##### 1、vnode 在什么情况 是一个数组呢？
##### 2、_parentVnode 什么时候有值？ 父子组件？

======================  17.8  ======================

## _update-runtime-mount

    文件：src/core/instance/lifecycle.js
    Vue.prototype._update

    vm._vnode 就是 _render 生成的 vnode
    引出 patch， vm.__patch__

### 问题
##### 1、restoreActiveInstance 不知道干啥用？

======================  17.9  ======================

## mountComponent-runtime-mount

    文件：src/core/instance/lifecycle.js
    收个尾，同时还有几个残留问题需要验证跟解决

>2个生命周期函数

    callHook(vm,'beforeMount') 在一进来的时候 就执行了 还没有生成 vnode
    callHook(vm,'mounted') 经历了一系列操作以后 生成了 vnode 在执行钩子函数

### 问题

#### 1、new Watcher 在这干了什么
#### 2、vm.$vnode == null 才会创建钩子函数 mounted，
        1)、vm.$vnode 不为空的话 就不创建 mounted 了？
        2)、vm.$vnode 什么时候不为空？

#### 3、跳过了 patch 过程，可能功能并不是很全

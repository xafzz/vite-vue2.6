
======================  提交分隔符  ======================
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

======================  提交分隔符  ======================

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

======================  提交分隔符  ======================

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

======================  提交分隔符  ======================

## mountComponent-runtime-mount

    文件：src/core/instance/lifecycle.js
    let vnode = vm._render() 是 undefined
    需要到 src/core/instance/render.js 完善 _render() 函数


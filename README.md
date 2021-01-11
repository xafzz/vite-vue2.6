
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

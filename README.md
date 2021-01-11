
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

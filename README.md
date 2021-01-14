
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


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

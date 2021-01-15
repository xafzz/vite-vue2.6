
## _update-runtime-mount

    文件：src/core/instance/lifecycle.js
    Vue.prototype._update

    vm._vnode 就是 _render 生成的 vnode
    引出 patch， vm.__patch__

### 问题
##### 1、restoreActiveInstance 不知道干啥用？

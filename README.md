
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

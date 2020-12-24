# 第六步 优化器 ast到optimize 静态标记

###### vue2中是有静态标记的

## 修复
    
    1、parse.js addDirective() 传参的时候少传了一个

### 1、markStatic 标记所有 非静态节点

#### 满足到条件

    无动态绑定
    没有v-if和v-for
    不是内置标签 内置的标签有slot和component
    是平台保留的标签(html,svg)
    不是template标签的直接字元素并且没有包含在for循环中
    节点包含的属性只能有isStaticKeys中指定的几个

### 2、markStaticRoots 标记静态根元素

#### 满足条件

    静态节点，并且有子节点，
    子节点不能仅为一个文本节点

### 总结
    
    第一步 markStatic
    第二步 markStaticRoots
    递归标记

### 问题

    1、options.optimize 没有探究从哪来的
    2、isDirectChildOfTemplateFor 函数没有写全

---------

##### 关于options

    必须之前加上 在parse阶段 跳过去了
    opzimize 阶段又用到了，
    重新搞下options，然后在重新梳理 parse跟opzimize阶段

-----------

##### 问题

    刚上来代码没敲2行 markStatic 直接给我return了，把我整懵B了

##### 小结

    要不趁现在还早 把柯里化跟options 各搞一个分支把
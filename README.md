
## initProxy - initMixin

###### 代理对象是es6的新特性，它主要用来自定义对象一些基本操作（如查找，赋值，枚举等）。


    在文件 src/core/instance/proxy.js
    实现initProxy

> 在Vue上添加 _renderProxy，但是不知道干什么用的
> 
> 如果是生产环境或者是不支持proxy的 renderProxy 就是 Vue 本身

#### hasProxy

    判断当前环境中 Proxy 是否可用，不能用的情况到时候打印

#### getHandler

    针对读取代理对象的某个属性时进行的操作
    当访问的属性不是string类型或者属性值在被代理的对象上不存在，则抛出错误提示，否则就返回该属性值。
    该方法可以在开发者错误的调用vm属性时，提供提示作用。

#### hasHandler

    应用场景在于查看vm实例是否拥有某个属性，比如调用for in循环遍历vm实例属性时，会触发hasHandler方法。

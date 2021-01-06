
==================================  提交分隔符  ===================================

## callHook - mergeOptions - initMixin

    在文件 src/core/instance/lifecycle.js
    需要先完善 src/core/util/options.js 里面的 strats

## callHook

### invokeWithErrorHandling

    handler.apply(context,args)
    handler.call(context)

## options.js
>options的合并策略，这块很关键
###### src/core/util/options.js

    1、el、propsData
    2、data
    3、LIFECYCLE_HOOKS 各个生命周期
    4、ASSET_TYPES  components/directives/filters
    5、watch 不是相互覆盖 而是合并
    6、props、methods、inject、computed
    7、provide

### mergeOptions

    1、checkComponents 组件名称
    2、normalizeProps props
    3、normalizeInject
    4、normalizeDirectives
    5、extends
    6、mixins
    7、mergeFieId 默认策略  优先组件里的属性

#### 踩坑

    对options的处理有问题 直接就是一个function,源码里面是个 object？ 找到原因了
    mergeOptions 合并的时候，出问题了，都没有吧生命周期合并到里面 
    对 const strats = config.optionMergeStrategies //{} 简单化了
    现在补上

==================================  提交分隔符  ===================================

###### 将两个放到一个分支了，不是没写就是不明白

## initRender - initMixin

    在文件 src/core/instance/render.js
    具体干了什么不清楚

## initEvents - initMixin

    在文件 src/core/instance/events.js
    没有具体实现


==================================  提交分隔符  ===================================

## initLifecycle - initMixin

###### vue实例一些属性进行赋值

    在文件 src/core/instance/lifecycle.js
    具体注释详见代码

==================================  提交分隔符  ===================================

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

==================================  提交分隔符  ===================================

## initGlobalAPI - initMixin

    在文件 src/core/core.js
    实现initGlobalAPI
    还没有去 initMixin 或者说没有 this._init()

#### configDef
>Vue.config更改给提示
#### Vue.util
>extend
>
>mergeOptions 合并options
>
>defineReactive 将数据处理成响应式数据
#### Vue.set、delete、nextTick
>set 详见分支 10-Observer-Dep-Watcher
>
> delete 详见分支 10-Observer-Dep-Watcher
>
> nextTick
#### Vue.observable
> 目前不知道要干什么
#### Vue.options
> 没有 options resolveConstructorOptions( vm.constructor ) 一直是undefined

------------
###### 下面几块都没有实现 用到的时候在写
#### KeepAlive
#### initUse
#### initMixin
#### initExtend
#### initAssetRegisters

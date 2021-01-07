# initMixin 之 this._init
###### 从下往上依次对应分支 11.1-7.

## initProvide - initMixin

#### initProvide

    从编译开始就有意略过去了，所以这儿也省略了，用到在完善

#### window.performance 前端性能，同时开启性能打印
    思来想去还是去百度下，so简单看了下，
    可以在浏览器控制台中：window.performance.getEntries() 
    怎么用呢，引入就不累赘了
    可以当成是 <div>xxx</div> 我要获取的就是中间的执行时间
    mark( 'start' )
        要观察的代码放入这儿
    mark( 'end' )
    //在 mark( 'end' ) 直接跟上 measure() 就可以
    measure(' 这就是要输出的name ' , 'start' , 'end')
    measure 参数说明
        第一个参数,打印出来的/显示的name
        第二个参数,mark( 'start' ),就是 start
        第三个参数,mark( 'end' ),就是 end
    在浏览器控制台
        //打印出来的结果里面 measure 第一个参数的 name 
        //duration 就是执行时间 单位是 毫秒数
        window.performance.getEntries() 
            name：资源名称，是资源的绝对路径或调用mark方法自定义的名称
            startTime:开始时间
            duration：加载时间
            entryType：资源类型，entryType类型不同数组中的对象结构也不同
            initiatorType：发起的请求者

#### window.performance 扩展 console.time(xx),console.timeEnd(xx)

    两者打印的时间 可以说一致
    后者直接在浏览器控制台进行打印了 xx：耗时数

======================  提交分隔符  ======================

## initState - initMixin
###### 说白话点就是 经过这个过程 data、methods、computed 里面的属性 在 vue 上都能找到了，props、watch一个没写一个卡住所以不清楚

>proxy() 似懂非懂

    在文件 src/core/instance/state.js
    data、methods、computed 都挂载到 vm 上
    computed 在 _computedWatchers 同时也在 _watchers ，他还有个 lazy 可能是缓存吧
    watch 没有 $watch

### props

###### 没有写，因为没有用到，包括编译

### methods

    initMethods()

### data 并将数据变成响应式数据

    initData()
    还是需要先在 src/core/util/options.js 处理下
    strats.data = function (parentVal,childVal,vm)

### computed
###### 1、_computedWatchers 在这里面
>defineComputed 这就不明白了

    initComputed()
    初始化 computed 的时候比较有意思，new watcher 去创建内部监视程序

### watch

    initWatch
    $watch 在这里直接使用是没有的，看了下源码在 stateMixin() 里等写到那儿的时候再回来补上

======================  提交分隔符  ======================

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

======================  提交分隔符  ======================

###### 将两个放到一个分支了，不是没写就是不明白

## initRender - initMixin

    在文件 src/core/instance/render.js
    具体干了什么不清楚

## initEvents - initMixin

    在文件 src/core/instance/events.js
    没有具体实现


======================  提交分隔符  ======================

## initLifecycle - initMixin

###### vue实例一些属性进行赋值

    在文件 src/core/instance/lifecycle.js
    具体注释详见代码

======================  提交分隔符  ======================

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

======================  提交分隔符  ======================

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

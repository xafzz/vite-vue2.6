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

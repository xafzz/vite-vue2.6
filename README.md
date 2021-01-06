
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

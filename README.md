# this._init() 之 initMixin (上)

###### 在 8-initMixin-initGlobalApi-options-compile，实现options传递给compile
###### 进行不下去了，initState等 需要 observe、dep、watcher支撑

-------

#### initProxy 不知道干啥的
#### initLifecycle 初始化了寂寞
#### initRender 
    createElement 暂时没有写，这么重要的东西 一定要敲着例子走
    省略了 definreactive，写 observe 的时候 回来补上
#### callHook 来问题了
###### 引出 src/core/util/options.js 对options 各个属性的处理，后续在完善
###### 包含了 watcher、props、methods、inject、computed 等
    我肯定是少了一步对options的处理，所以 typeof
        我的是function,
        源码里面是 object
    找到问题了 mergeOptions 时候出问题了 详见 src/core/util/options.js
    const strats = config.optionMergeStrategies 只是开始

    对生命周期的处理 src/core/util/options.js 处理成一个object 而不是 funciton
    LIFECYCLE_HOOKS.forEach(hook=>{
        strats[hook]=mergeHook
    })

#### initInjections 没有写

#### initState
    1、props
    2、methods -> initMethods
        将 methods 里面的方法 挂载到 vm
    3、data -> initData
        src/core/util/options.js中strats.data = function (parentVal,childVal,vm)有密切关系

        proxy 这个方法也很有意思
            a、将data整个object 挂载到 vm._data上
            b、将data里面到各个属性 挨个挂载到vm上

        通过 observe 类将数据变成响应式数据

    4、computed
    5、watch
    

-------
#### server.js 改动
###### 编译过程中添加文件报错 

        getUrl:function (url){
            return cached[url]
        }
        修改为
        getUrl:function (url){
            return url
                ? cached[url] ? cached[url] : ''
                : cached
        }

-------
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

-------

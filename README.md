
## initProvide - initMixin

### initProvide
    
    从编译开始就有意略过去了，所以这儿也省略了，用到在完善

### window.performance 前端性能，同时开启性能打印

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

### window.performance 扩展 console.time(xx),console.timeEnd(xx)

    两者打印的时间 可以说一致
    后者直接在浏览器控制台进行打印了 xx：耗时数


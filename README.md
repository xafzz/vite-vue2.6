# stateMixin
###### 具体注释在代码里面、以及代码的测试用例

    1、将 $data、$props 挂载到原型上 并且不能修改
    2、$set、$delete 挂载到原型上 这样就可以直接 this 调用了
    3、$watch 
    
### Vue.prototype.$watch
    
    主要是对组件中对 watch 进行处理
    完善了 watcher、dep、observe ，同时又走一遍，详细注释在代码
    return 最后 这块不明白，打印了 用到时候再回来部

## 总结
    
    state.js 分2个函数，两者还是有联系的

>initState() 初始化钩子函数

    props、methods、data、computed、watch 钩子的函数的 初始化

>stateMixin()

    Vue原型上添加 $props、$data、$set、$delete、$watch

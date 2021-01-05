#  Observer-Dep-Watcher
#######先把这块写一写，init相关的很多内容都涉及到了
    1、/src/core/instance/instance.js 的 function Vue() 中

        let obj = {
            a:1
        }
        let obj = [1, 2,
            [3, 4],
            [
                {name:'a',age:10},
                {name:'b',age:11}
            ]
        ]
        Observer(obj)
### 写了好几次了都没有写处理Array的在这补上把
####### 还是实现 set 跟 del 把，在global-api就用到了
>要执行这2个有个必要条件就是响应式数据 根据 __ob__ 判断
>
>dep.notify 都会通知 dep 更新依赖

### set (vue $set)

    1、不能是 undefined, null
    2、数组有数组的处理方法
    3、响应式数据
    4、调用 defineReactive 
    5、dep.notify 都会通知 dep 更新依赖

### del (vue $del)

    1、不能是 undefined, null
    2、数组有数组的处理方法
    3、响应式数据
    4、key要存在当前 object/array 中
    5、delete 删除 key
    6、dep.notify 都会通知 dep 更新依赖

### 知识点

    js 注释的使用方法

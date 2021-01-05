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

    没有实现 set 跟 del


### 知识点

    js 注释的使用方法

# 第五步 template模版转为ast 

    保留之前分支 template-ast ，停止维护，那个分支 没有 options 
    这个分支添加了 options 
    还有一个很重要的东西 options.whitespace 两种模式
        preserve ： 默认模式
        condense ： 空格压缩没有了 子节点里面 只有节点跟内容了(children数量少了很多)

## 新增了对 class style 以及 v-model 的支持，当然也是通过options实现
    代码 src/compiler/modules/index.js

## 压缩模式跟常规模式的区别 options.whitespace（preserve、condense）

## 总结

### 1、parse
#### 通过parseHTML各个钩子函数将template转化ast
##### start     开始标签

    这块量大的惊人，我写的时候真是写到放弃，真佩服作者
    这个过程说白就是将标签里面的各个属性挂载到对应的节点上 属性之多 可以自行脑补
    包含v-pre ---> processRawAttrs()
    不包含v-pre的 将v-for v-if v-once
        v-for ---->processFor()
        v-if ---->processIf()
        v-once ---->processOnce()

    开始标签就要说说 自闭合标签 这还真是个特例
    非自闭合标签 closeElement() 步入正题，(这个地方也放弃过一次)
        processElement() <------ 就是他，个人感觉是核心了
            processKey()  在上面写v-for的时候 我就好奇 :key 怎么搞 
            processRef() ref
            processSlotContent() slot  代码也不全 v-slot 的没有搞上去
            processSlotOutlet()   <slot /> 
            processComponent()  组态组件 is、内联模版 inline-template 
            processAttrs() <----- 又来一个NB的，干的事情可是真多啊 属性开始挂载，(写到放弃)
                才知道v-bind跟v-on的写法那么多！！！！
                v-bind:     prop、camel、sync 很多我都没有用过尴尬
                v-on        各个修饰符 prevent、right、middle、capture、capture、native
                    addHandler() 这个函数也不容小觑
                id、class、style、title、href 普通的属性 不是vue 的属性
    也是在下面 终于将 el.parent 终于不再是 underfined 了
    紧接着就是 e.children 也有值了




##### end       结束标签

    最后补充的这个钩子函数
    closeElement 这个函数本来在 start里面放弃了 结果有碰到又一次 硬着头皮在继续写

##### chars     文本

    这块相对来说也还可以 就是对字符串的处理 有些没有实现出来

##### comment   注释

    这块基本没什么好说的，又一个点需要注意下
    我是先上来写的注释 所以当时 currentParent 是没有值 很尴尬



### 2、parseHTML

    通过while、advance函数，将 template 字符串进行挨个循环
    正则不能少
    1)、处理非 script textarea style 元素

        根据 "<" 进行判断
            注释 条件注释     
                跳转钩子函数 comment
            Doctype
            开始标签（我先处理对 开始标签 所以一直不通 直到把 结束标签补充上才有点明白 建议按照源码的顺序来）
                跳转钩子函数 start
            结束标签        
                跳转钩子函数 end
        文本内容
            跳转钩子 chars


    2)、处理 script textarea style 在这没有写

------------
    普通的属性放到attrs、attrsMap
    v-if v-for 等直接挂载到当前元素上
    children 将字元素放到这个里面
    parent 存放父元素
    tag 就是标签喽
    type 类型

## 结语
    有很多todo直接写到里面，包括@todo，#todo，实话实说很多不明白的地方
    注释有点多，因为不明白的地方实在有点多，比较符合我代码的风格，哈哈
    在不断的放弃中，终于搞完一版

## 问题
    
    processSlotContent 函数没有写完整  //2.6 用 v-slot
    processAttrs v-bind修饰符 .sync 没有写完整
    genAssignmentCode 没有写完整
    IE相关的代码忽略
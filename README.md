
## _createElement-runtime-mount
###### 第一遍出问题了虽然解决了全删了代码这算是第二版吧，注释可能较第一版少了

    文件：src/core/vdom/create-element.js 里面的 _createElement

### normalizeChildren

    文件：src/core/vdom/helpers/normalize-children.js

###### 我们生成的js，DOM是按照dom的结构形式表现出来的
###### 这块需要先完成后面的代码，return过一个vnode以后才行，要不然全是undefined
    1、将结构打平，通过递归的方式
    2、检测在使用v-for的时候 是否设置 key 如果没有的话，系统添加上 key
        `__vlist${nestedIndex}_${i}__`

### 总结
###### 完成了_createElement 前几步又可以继续进行(完善)
    
    验证部分省略了，可以看代码

>2个模式
>
    1、compile时options.whitespace = 'condense'
    2、createElement时，SIMPLE_NORMALIZE、ALWAYS_NORMALIZE
       关于这2种 src/core/vdom/create-element.js 有详细的说明


### 问题
#### 1、!('@binding' in data.key)
    
    位置：/src/core/vdom/create-element.js 中的 _createElement
    @binding 什么意思？

#### 2、在compile过程的时候提到了 options.whitespace = 'condense' 压缩模式

    在生成 vnode 的时候 也是会有影响的

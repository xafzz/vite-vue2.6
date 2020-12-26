# this._init() 之 initMixin

###### 对接compile，options传递给compile

    function Vue 在 src/core/instance/index.js ，这儿是 instance.js

### initMixin 

    instance/init.js
    应该是提到this_init()，就要说一说initMixin
    在Vue的原型上添加了_init(Vue.prototype._init=function())
    
##### mergeOptions

    合并options

### initGlobalAPI 全局API

    global-api/index.js 里面
    全局API以静态属性和方法的形式被添加到 Vue 构造函数
    这个还是要先写的，要不到了initMixin里面的mergeOptions少点东西
    东西确实不少，目前是简单实现，只是让 options 不在为空

### 知识点

##### 1、Web Performance
    API允许网页访问某些函数来测量网页和Web应用程序的性能

### 填坑

#### 1、options.delimiters  undefined

    delimiters 在 parse.js/parse 里面多次用到了，当时的处理是undefined
    在 parseTEXT.js/parseText 也用到了 delimiters

#### 2、options.comments undefined

    parseHTML.js 里面 if( comment.test(html) )
    1、if( commentEnd > 0 ) 把0吃了 应该是 if( commentEnd >= 0 )
    2、options.comment(html.substring(4,commentEnd),index,index+commentEnd+3)
       有if条件 if (options.shouldKeepComment) 
       就是从 vue/index.js 调用 compileToFunctions 传过去的
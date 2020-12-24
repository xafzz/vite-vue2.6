# 第七步 generate 

###### 这个的复杂程度跟parse()有的一拼。而且两者联系非常紧密。而且options很关键，以及whitespace压缩模式

####### TODO 需要重敲一次

### 一句话概括

    标签如果有 v-once 就把当前节点及下面所有子节点 放到 staticRenderFns 里面
    没有 v-once 就放到 render 里面
    如果父节点有v-once，子节点里面又有v-once，
    staticRenderFns 是平级的关系，但是父节点生成的 不包含 v-once子节点的

### 步骤

    1、new CodegenState() 很关键跟options有关系 
    2、genElement() 又开始对v-for v-if template slot 分别处理
        genOnce() v-once 还有一块没有写全
            genStatic()   不只是处理静态根节点 以及 v-once 放到 staticRenderFns 就是在这里面
            
        genFor()  v-for 
        genIf()   v-if
        //template slot 这块没有写
        else 才进入正文
            genData() 这个就NB大发了，对各个属性处理 顺便拼装
                genDirectives() 干啥？指令 就是这个
                    有下面这一段⬇️
                    let gen = state.directives[dir.name]
                    if( gen ){
                        // compile-time directive that manipulates AST.
                        // returns true if it also needs a runtime counterpart.
                        //跑到  directives/model.js 里面了 v-model 挂载
                        needRuntime = !!gen(el,dir)  ⬅️就是这个 里面了 v-model 挂载 **很关键** 回到 CodegenState->options.directives
                    }

            genChildren()  (let children = el.inlineTemplate ? null : genChildren(el, state, true) 递归开始吧)
        return code
    3、return {
          render,
          staticRenderFns
       }
    

### 静态标记
    
    满足静态根节点的前提下
    只有包含 class 或者 style 或者 <div></div> 空标签就是 静态根节点,有id的时候 就不是静态根节点
    
### 问题

    1、genData() 很多没有写全，用到的时候 再回来补上
    2、modifiers.number 是什么啊

### 注意

    options.whitespace = 'condense' 前面说过 压缩模式 在这也受影响
    

### 改动
    
    1、将项目中的index.js 都改为对应的名字，index不方便调试
    2、pluckModuleFunction 从 parse/parse.js 移到 helpers.js 里面
    3、extend 从 parse/parse.js 移到 shared/util.js 里面
    4、addHandler 从parse/parse.js 移到 helpers.js 里面 

### 填坑
#### 1、parseHTML.js->handleStartTag()->expectHTML->canBeLeftOpenTag(tagName) && lastTag === tagName
    <div className="main" style="background: red;border: 1px solid red;">
         <p>
            <p>ddd</p>
         </p>
     </div>

    end(tag,start,end){
        // 每当解析到标签的结束位置时，触发该函数
        let element = stack[ stack.length - 1 ]
        //@todo 为什么会有负数出来 尴尬
        stack.length -= 1
        currentParent = stack[ stack.length -1 ]
        if( options.outputSourceRange ){
            element.end = end
        }
        closeElement(element)
    }
#### 2、parse.js->closeElement()-> if( !stack.length && el !== root ){

    <div id="main" :class="dd" v-on:click=tag" title="1" class="main" style="background: red;border: 1px solid red;" >
    
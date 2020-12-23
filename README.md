# 第七步 generate


### 静态标记
    
    满足静态根节点的前提下
    只有包含 class 或者 style 或者 <div></div> 空标签就是 静态根节点,有id的时候 就不是静态根节点
    


### 改动
    
    1、将项目中的index.js 都改为对应的名字，index不方便调试
    2、pluckModuleFunction 从 parse/parse.js 移到 helpers.js 里面
    3、extend 从 parse/parse.js 移到 shared/util.js 里面

### 填坑
#### parseHTML.js->handleStartTag()->expectHTML->canBeLeftOpenTag(tagName) && lastTag === tagName
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
# 第七步 generate


### 静态标记
    
    满足静态根节点的前提下
    只有包含 class 或者 style 或者 <div></div> 空标签就是 静态根节点,有id的时候 就不是静态根节点
    


### 改动
    
    pluckModuleFunction 从 parse/index.js 移到 helpers.js 里面
    extend 从 parse/index.js 移到 shared/util.js 里面

### 填坑
#### parseHTML.js->handleStartTag()->expectHTML->canBeLeftOpenTag(tagName) && lastTag === tagName
    <div className="main" style="background: red;border: 1px solid red;">
         <p>
            <p>ddd</p>
         </p>
     </div>
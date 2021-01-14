
## renderStatic-installRenderHelpers-runtime-mount

### 补坑
###### 完善了 _createElement

#### 1、renderStatic

    文件：src/core/instance/render-helpers/render-static.js
    给静态vnode 打上属于静态的标记
    node.isStatic = true
    node.key = key
    node.isOnce = isOnce
    
#### 2、normalizeArrayChildren

    文件：src/core/vdom/helpers/normalize-children.js
    1、if( isUndef(c) || typeof c === 'boolean' ) c 是 undefined 没有任何返回的时候 进去了
    2、if (isTextNode(c) && isTextNode(last))
        只有在编译的时候 没有开启 压缩模式 options.whitespace = 'condense' 才会走到这
        如果开启了压缩模式 目前不会走到这儿
    

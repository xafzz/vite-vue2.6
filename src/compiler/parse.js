import { no }  from '../shared/util.js'

import parseHTML from './parseHTML.js'
//IE 的暂时忽略

const invalidAttributeRE = /[\s"'<>\/=]/;
//html 转 ast
export default function parse(template,options){
    //options 是空的


    let preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
    let platformGetTagNamespace = options.getTagNamespace || no
    // 从前面过来的
    // console.log(7)
    // 存放没有闭合的标签元素基本信息  当找到闭合标签后清除存在于stack里面的元素
    const stack = []
    // 解析后的最终数据 应用了引用类型的特性 使root像滚雪球一样保存标签的所有信息
    let root;
    // 需要处理的元素父级元素
    let currentParent;


    //https://www.cnblogs.com/linjunfu/p/11074494.html 对解析很详细
    parseHTML(template,{

        //这个和end对应 主要处理开始标签和标签的属性
        //tag  标签名 attrs 元素 属性  unary  该元素 是否单元素 img
        /**
         * @param {string}  tag 解析到的开始标签名，如 <div></div> 中开始标签 <div> 中的div
         * @param {Array}   attrs   解析到的开始标签上的属性，如 [{name: 'class', value: 'className'}]
         * @param {Boolean} unary   标签是否时自闭合标签， true 或者 false
         * @param {Number}  start   解析到的开始标签在需要解析的 html 模版中所占的开始位置
         * @param {Number}  end     解析到的开始标签在需要解析的 html 模版中所占的结束位置
         */
        start(tag,attrs,unary,start,end){
            // 每当解析到标签的开始位置时，触发该函数
            let ns = (currentParent && currentParent.ns ) || platformGetTagNamespace(tag)
            //IE svg 不用
            //创建 ast
            let element = createASTElement(tag,attrs,currentParent)
            if(ns){
                element.ns = ns
            }
            //假定就是在测试环境
            // todo  测试环境 这个地方假定 为true
            //outputSourceRange: process.env.NODE_ENV !== 'production', options.outputSourceRange
            let outputSourceRange = true
            if( outputSourceRange ){
                element.start = start
                element.end = end
                //reduce 接收一个函数作为累加器 数组中的每个值开始缩减 最终计算为一个值
                //{} 初始值 不传 第一个 包裹不起来
                element.rawAttrsMap = element.attrsList.reduce((cumulated,attr)=>{
                    cumulated[ attr.name ] = attr
                    return cumulated
                },{})
                attrs.forEach(attr=>{
                    if( invalidAttributeRE.test(attr.name) ){
                        console.warn(`${attr.name}，属性名不能是：spaces, quotes, <, >, / or =.`)
                    }
                })

            }

            //偷个懒 下个 参数不写了 判断是不是 script 或者 style
            if( isForbiddenTag(element) ){
                element.forbidden = true
                console.warn(`<${element.tag}>as they will not be parsed`)
            }

            // apply pre-transforms
            //todo 这里options 没有传 是空 暂时验证不了
            for (let i =0,len = preTransforms.length;i<len;i++){
                element = preTransforms[i](element,options) || element
            }

            console.log(preTransforms,9999)

            console.log(element,tag,element.tag)
        },
        //闭合元素 更新 stack currentParent
        /**
         * @param {string} tag  解析到的结束标签名，如 <div></div> 中结束标签 </div> 中的div
         * @param {Number} start    解析到的结束标签在需要解析的 html 模版中所占的开始位置
         * @param {Number} end      解析到的结束标签在需要解析的 html 模版中所占的结束位置
         */
        end(tag,start,end){
            // 每当解析到标签的结束位置时，触发该函数
            console.log(tag)
        },
        //处理文本 和 {{}}
        /**
         * @param {string} text  解析到的纯文本，如 <p>我是纯文本</p> 中 p 标签包含的纯文本
         * @param {Number} start 解析到的纯文本在需要解析的 html 模版中所占的开始位置。注：不一定有，可能没传
         * @param {Number} end   解析到的纯文本在需要解析的 html 模版中所占的结束位置。注：不一定有，可能没传
         */
        chars(text,start,end){
            // 每当解析到文本时，触发该函数
            //如果是文本 没有父节点 直接返回
            if( !currentParent ){
                // if (process.env.NODE_ENV !== 'production') {}
                if( text === template ){
                    console.warn('Component template requires a root element, rather than just text.')
                }
                // if( ( text = text.trim() ) ){
                //     console.warn("text \"" + text + "\" outside root element will be ignored.")
                // }
                return
            }

            //IE 跳过
            let children = currentParent.children
            // 判断与处理text, 如果children有值，text为空，那么text = ' '; 原因在end中 ？
            text = text.trim()
                ? text
                : children.length() ? ' ' : ''

            if(text){
                console.log('chars->没有进来')
            }

        },
        //处理template 里面的 注释
        //这是吧注释的东西 搞出来
        //text 注释的内容  start 从第几个开始 到 第几个结束
        /**
         * @param {string} text  解析到的注释，如 <!-- 我是注释 -->。text经过处理，截取了注释箭头中的纯文本
         * @param {Number} start 解析到的注释在需要解析的 html 模版中所占的开始位置
         * @param {Number} end   解析到的注释在需要解析的 html 模版中所占的结束位置
         */
        comment(text,start,end){
            //禁止向跟节点 添加任何作为同级节点的呢日
            //注释仍然被允许 但是被忽略
            //（如果是第一次 执行 while 获取到 start end 还没有走到 这不好理解）
            //(我才是写 特意加了注释 看效果 结果 看不懂了 此时 start,end,chars 还是空的)
            if( currentParent ){
                let child = {
                    type: 3,
                    text:text,
                    isComment: true
                }
                // if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
                    child.start = start
                    child.end = end
                // }
                console.log('这是注释')

                currentParent.children.push(child)
            }
        }
    })

    return root
}

//ast 的容器
function createASTElement(tag,attrs,parent){
    return {
        type:1,
        tag,
        //暂存的属性数组， 通过match和循环 组装的一个{name，value数组}
        //包含vue内置的指令 和用户自定的属性
        attrsList:attrs,
        attrsMap:makeAttrsMap(attrs),
        rawAttrsMap:{},
        parent,
        children:[]
    }
}
//塞入map 用key value 的形式 存起来
function makeAttrsMap(attrs){
    let map = {}
    for( let i=0,l=attrs.length;i<l;i++){
        map[ attrs[i].name ] = attrs[i].value
    }
    return map
}

//div p 没有 type
function isForbiddenTag(el){
    return (
        //style 标签
        //<style type="text/css"></style>
        el.tag === 'style' ||
        (
            //script 标签
            el.tag === 'script' && (
                //<script type="text/javascript">dddd</script>
                !el.attrsMap.type || el.attrsMap.type === 'text/javascript'
            )
        )
    )
}

function pluckModuleFunction (modules,key){
    return modules
        ? modules.map(m=>{
            return m[key]
        }).filter(_=>_) //filter 创建一个新的数组，新数组中的元素是通过检查制定的数组中的符合条件的所有元素
        : []
}














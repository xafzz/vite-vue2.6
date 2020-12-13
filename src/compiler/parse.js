import { no }  from '../shared/util.js'

import parseHTML from './parseHTML.js'
import {
    getAndRemoveAttr,
    getBindingAttr
} from "./helpers.js";
//IE 的暂时忽略

const invalidAttributeRE = /[\s"'<>\/=]/;
//正则 in/of for循环体
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
//正则 value,key 之类的形式
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
//正则括号 ()
const stripParensRE = /^\(|\)$/g;
//html 转 ast
export default function parse(template,options){
    //options 是空的


    let preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
    let platformGetTagNamespace = options.getTagNamespace || no
    let platformIsPreTag = options.isPreTag || no
    // 判断 v-pre 指令
    let inVPre = false
    // todo 不知道干啥
    let inPre = false
    // 从前面过来的
    // console.log(7)
    // 存放没有闭合的标签元素基本信息  当找到闭合标签后清除存在于stack里面的元素
    const stack = []
    // 解析后的最终数据 应用了引用类型的特性 使root像滚雪球一样保存标签的所有信息
    let root;
    // 需要处理的元素父级元素
    let currentParent;

    // todo 是指的根元素单闭合吗
    //处理单闭合标签
    function closeElement(el){
        trimEndingWhitespace(el)
        if( !inVPre && !el.processed ){
            console.log('单闭合标签',el)
            el = processElement(el,options)
        }
        console.log(el,990)
    }
    function trimEndingWhitespace(el){
        //remove trailing whitespace node
        //没有地方 处理 iuPre 所以 上来是false
        if( !inPre ){
            let lastNode
            //el.children 是空的啊 []
            while (
                (lastNode = el.children[el.children.length - 1]) &&
                lastNode.type === 3 &&
                lastNode.text === ''
            ){
                console.log('todo->trimEndingWhitespace')
                el.children.pop()
            }
        }
    }
    //检测根元素
    function checkRootConstraints(el){
        if( el.tag === 'slot' || el.tag === 'template' ){
            console.warn(`Cannot use <${el.tag}> as component root element because it may`)
        }
        //hasOwnProperty Object 原型的方法 检测一个属性是否是对象的自由属性
        if( el.attrsMap.hasOwnProperty('v-for') ){
            console.warn(`Cannot use v-for on stateful component root element because`)
        }
    }

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
                console.log('todo ->preTransforms')
                element = preTransforms[i](element,options) || element
            }

            //默认值为false
            //v-pre 不被解析的文本的时候 可以加 v-pre 输出 {{msg}}
            if( !inVPre ){
                //将标签中的 v-pre 剔除 在el中中 el.pre = ture 表示
                processPre(element)
                if( element.pre ){
                    inVPre = true
                }
            }
            //没有options 所以 这地方都是 false
            if(platformIsPreTag(element.tag)){
                inPre = true
            }
            //有v-pre标签
            if( inVPre ){
                //标签 属性 包含 v-pre 的情况 才走到这
                //从结果上看 相当于是 将数组 attrsList 复制给了 attrs
                processRawAttrs(element)
            }else if( !element.processed ){
                //@todo 有pre 的时候 不走这块
                //element.processed 什么时候加上的 没有加啊
                //没有 v-pre 的时候 又开始走这
                //结构指令 v-for v-if v-once
                processFor(element)
                // v-if v-else v-else-if
                processIf(element)
                // v-once
                processOnce(element)
            }

            //这时候root还是没有的
            if( !root ){
                root = element
                //es6 块级作用域
                {
                    // let root =1
                    // 在里面打印 root 就是1 在外面 就是 element
                    //检测根元素
                    checkRootConstraints(root)
                }
            }

            //非单元素 不是 img @todo 指的是根元素吗
            if( !unary ){
                //根元素有了 chars 里面 可以操作了
                currentParent = element
                // 从前面过来的
                stack.push(currentParent)
            }else{
                closeElement(element)
            }

            // console.log(root,unary,22,currentParent)

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
//todo 不知道啥意思
function pluckModuleFunction (modules,key){
    return modules
        ? modules.map(m=>{
            return m[key]
        }).filter(_=>_) //filter 创建一个新的数组，新数组中的元素是通过检查制定的数组中的符合条件的所有元素
        : []
}

//将v-pre指令 放到 el 中用el.pre = true 标示
function processPre(el){
    // 将 v-pre 从 attrsList 中删除
    if( getAndRemoveAttr(el,'v-pre') != null ){
        //添加到 el 中 作为标示
        el.pre = true
    }
}
/**
 * {     attrsList: Array(5)
         0: {name: "id", value: "main", start: 5, end: 14}
         1: {name: "class", value: "main", start: 15, end: 27}
         2: {name: "style", value: "background: red", start: 34, end: 57}
         3: {name: "@click", value: "tag", start: 58, end: 70}
         4: {name: "v-show", value: "show", start: 71, end: 84}
         length: 5
         __proto__: Array(0)
         attrsMap: {id: "main", class: "main", v-pre: "", style: "background: red", @click: "tag", …}
         children: []
         end: 85
         parent: undefined
         pre: true
         rawAttrsMap:
         @click: {name: "@click", value: "tag", start: 58, end: 70}
         class: {name: "class", value: "main", start: 15, end: 27}
         id: {name: "id", value: "main", start: 5, end: 14}
         style: {name: "style", value: "background: red", start: 34, end: 57}
         v-pre: {name: "v-pre", value: "", start: 28, end: 33}
         v-show: {name: "v-show", value: "show", start: 71, end: 84}
         __proto__: Object
         start: 0
         tag: "div"
         type: 1
 * }

 * */
//标签 属性 包含 v-pre 的情况 才走到这
//从结果上看 相当于是 将数组 attrsList 复制给了 attrs
function processRawAttrs(el){
    let list = el.attrsList
    let len = list.length
    if(len){
        //将这个数组 塞入 el 里面 但是 没有v-pre到时候 是没有这个的
        let attrs = el.attrs = new Array(len)
        for( let i=0;len > i;i++ ){
            attrs[i] = {
                name:list[i].name,
                //将javascript值转化为JSON字符串
                value:JSON.stringify(list[i].value)
            }
            //这个地方start绝对存在
            //但是在生产环境中到时候 不存在
            if( list[i].start != null ){
                attrs[i].start = list[i].start
                attrs[i].end = list[i].end
            }
        }
    }else if( !el.pre ){
        // non root node in pre blocks with no attributes
        el.pain = true
    }
}

//指令 v-for
function processFor(el){
    let exp
    // 将 v-for 从 el.attrsList 中删除
    // 但是attrsList 里面 还有 :key
    if( (exp = getAndRemoveAttr(el,'v-for')) ){
        //exp 为 (item,key) in list
        //将 v-for 后面的 各种情况 都处理下 然后 返回一个 关于 v-for的object
        // v-for="item in list"  {for: "list", alias: "item"}
        // v-for="(item,key) in list" {for:"list",alias:"item",iterator1:"key"}
        // v-for="(item,key,index) in list" {for:"list",alias:"item",iterator1:"key",iterator2:"key"}
        const res = parseFor(exp)
        if( res ){
            //将属性混合到el中
            extend(el,res)
        }else{
            console.warn(`Invalid v-for expression:${exp}`)
        }
    }
}

//v-for = 后面的 那段 (item,key) in list
function parseFor(exp){
    // in of 正则一哈
    let inMatch = exp.match(forAliasRE)
    if( !inMatch ){
        return
    }
    let res = {}
    //循环的对象是谁 in/of 后面的
    res.for = inMatch[2].trim()
    //循环 中 value跟 key  in/of 前面的 将 () 替换成 空
    let alias = inMatch[1].trim().replace(stripParensRE,'')
    //iteratorMatch [",key", "key", undefined, index: 4, input: "item,key", groups: undefined]
    let iteratorMatch = alias.match(forIteratorRE)
    //item in xxx null  alias->item
    //(item) in xxx null    alias->item
    //(value,key) in xx iteratorMatch true
    if(iteratorMatch){
        //value
        res.alias = alias.replace(forIteratorRE,'').trim()
        // key
        res.iterator1 = iteratorMatch[1].trim()
        //(item,key,index) in list
        //有下标的时候
        if( iteratorMatch[2] ){
            res.iterator2 = iteratorMatch[2].trim()
        }
    }else{
        res.alias = alias
    }
    return res
}

//将属性混合到el中
function extend(el,_form){
    for( let key in _form ){
        el[key] = _form[key]
    }
    return el
}

//v-if
function processIf(el){
    //v-if= 后面的 表达式
    let exp = getAndRemoveAttr(el,'v-if')
    if( exp ){
        //if的表达式
        el.if = exp
        addIfCondition(el,{
            exp,
            block:el
        })
    }else{
        //v-else
        if( getAndRemoveAttr(el,'v-else') != null ){
            el.else = true
        }
        //v-else-if
        let elseif = getAndRemoveAttr(el,'v-else-if')
        if( elseif ){
            //elseif 表达式
            el.elseif = elseif
        }
    }
}
//为if 添加 addIfCondition属性
function addIfCondition(el,condition){
    if( !el.ifConditions ){
        el.ifConditions = []
    }
    el.ifConditions.push(condition)
}
//v-once
function processOnce(el){
    let once = getAndRemoveAttr(el,'v-once')
    if( once != null ){
        el.once = true
    }
}

function processElement(el,options){
    processKey(el)
}
//将:key
function processKey(el){
    //标签里面 含有 key = 1 exp返回1
    //:key=xxx v-bind:key=xxx
    let exp = getBindingAttr(el,'key')
    console.log(exp,222,55)
}
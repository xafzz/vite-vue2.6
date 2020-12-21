import { no }  from '../shared/util.js'

import parseHTML from './parseHTML.js'
import {
    getAndRemoveAttr,
    getBindingAttr,
    getRawBindingAttr,
    addAttr,
    cached  //将创建缓存的移到helper里面
} from "./helpers.js";
import parseFilters from "./filter-parser.js";
//IE 的暂时忽略

//冻结的值 热然可以将变量的引用替换掉
//冻结数据 纯展示大数据 都可以使用 Object.freeze 提高性能
const emptyObject = Object.freeze({})
//vue 标签属性 v- @ #
const onRE = /^@|^v-on:/;
const dirRE = /^v-|^@|^:|^#/;
const bindRE = /^:|^\.|^v-bind:/;
const argRE = /:(.*)$/;

const dynamicArgRE = /^\[.*\]$/;
//v-bind.a
const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;
const invalidAttributeRE = /[\s"'<>\/=]/;
//正则 in/of for循环体
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
//正则 value,key 之类的形式
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
//正则括号 ()
const stripParensRE = /^\(|\)$/g;
//双花括号
const  defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;


const buildRegex = cached((delimiters)=>{
    let open = delimiters[0].replace(regexEscapeRE,'\\$&')
    let close = delimiters[1].replace(regexEscapeRE,'\\$&')
    return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})
/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g;
const camelize = cached(function (str) {
    return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});
let decoder
const he = {
    decode : (html)=>{
        decoder = decoder || document.createElement('div')
        decoder.innerHTML = html
        return decoder.textContent
    }
}

const decodeHTMLCached = cached(he.decode)


let transforms,delimiters,platformMustUseProp,postTransforms
//html 转 ast
export default function parse(template,options){
    //options 是空的

    //todo pluckModuleFunction
    let preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
    let platformGetTagNamespace = options.getTagNamespace || no
    let platformIsPreTag = options.isPreTag || no
    let transforms = pluckModuleFunction(options.modules, 'transformNode')
    let postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
    let preserveWhitespace = options.preserveWhitespace !== false
    let platformMustUseProp = options.mustUseProp || no
    // 判断 v-pre 指令
    let inVPre = false
    // todo 不知道干啥
    let inPre = false
    let whitespaceOption = options.whitespace
    let delimiters = options.delimiters
    // 从前面过来的
    // console.log(7)
    // 存放没有闭合的标签元素基本信息  当找到闭合标签后清除存在于stack里面的元素
    let stack = []
    // 解析后的最终数据 应用了引用类型的特性 使root像滚雪球一样保存标签的所有信息
    let root;
    // 需要处理的元素父级元素
    let currentParent;

    // todo 是指的根元素单闭合吗
    //处理单闭合标签
    function closeElement(el){
        //一进来先删除一遍
        trimEndingWhitespace(el)
        if( !inVPre && !el.processed ){
            //经过 processElement 将 attrsList 中的 key 挂载到 el 中 通过el.key
            //这个方法NB啊 将各个属性都
            el = processElement(el,options)
        }
        if( !stack.length && el !== root ){
            //todo 打印的时候 在补上
            console.error(`没有走到这，判断条件是 !stack.length && el !== root`)
        }
        //终于
        if( currentParent && !el.forbidden ){
            //template 包含  else
            if( el.elseif || el.else ){
                processIfConditions(el,currentParent)
            } else {
                // scoped slot
                // keep it in the children list so that v-else(-if) conditions can
                // find it as the prev node.
                if( el.slotScope ){
                    let name = el.slotTarget || '"default"'
                    ;(currentParent.scopedSlots || ( currentParent.scopedSlots = {} ))[name] = el
                }
                //终于有了 parent 了
                currentParent.children.push(el)
                el.parent = currentParent
            }
        }

        // final children cleanup
        // filter out scoped slots
        el.children = el.children.filter(c => !(c).slotScope)
        // remove trailing whitespace node again
        trimEndingWhitespace(el)

        //检查与状态
        if( el.pre ){
            inVPre = false
        }
        if( platformIsPreTag(el.tag) ){
            inPre = false
        }

        for (let i = 0; i < postTransforms.length; i++) {
            postTransforms[i](el, options);
        }

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

        },
        //闭合元素 更新 stack currentParent
        /**
         * @param {string} tag  解析到的结束标签名，如 <div></div> 中结束标签 </div> 中的div
         * @param {Number} start    解析到的结束标签在需要解析的 html 模版中所占的开始位置
         * @param {Number} end      解析到的结束标签在需要解析的 html 模版中所占的结束位置
         */
        end(tag,start,end){
            // 每当解析到标签的结束位置时，触发该函数
            let element = stack[ stack.length - 1 ]
            //
            stack.length -= 1
            currentParent = stack[ stack.length -1 ]
            if( options.outputSourceRange ){
                element.end = end
            }
            closeElement(element)
        },
        //处理文本 和 {{}}
        /**
         * @param {string} text  解析到的纯文本，如 <p>我是纯文本</p> 中 p 标签包含的纯文本
         * @param {Number} start 解析到的纯文本在需要解析的 html 模版中所占的开始位置。注：不一定有，可能没传
         * @param {Number} end   解析到的纯文本在需要解析的 html 模版中所占的结束位置。注：不一定有，可能没传
         */
        chars(text,start,end){
            // console.log('init->',text)
            // 每当解析到文本时，触发该函数
            //如果是文本 没有父节点 直接返回
            if( !currentParent ){
                // if (process.env.NODE_ENV !== 'production') {}
                if( text === template ){
                    console.warn('Component template requires a root element, rather than just text.')
                }else if( ( text = text.trim() ) ){
                    console.warn("text \"" + text + "\" outside root element will be ignored.")
                }
                return
            }

            //IE 跳过  在最下面拿到了
            let children = currentParent.children
            if( inPre || text.trim() ){
                //是否是 script 或者 style
                //不是搞成字符串
                text = isTextTag(currentParent) ? text : decodeHTMLCached(text)
            }else if( !children.length ){
                // remove the whitespace-only node right after an opening tag
                text = '';
            }else if( whitespaceOption ){
                console.log('3333')
            }else{
                text = preserveWhitespace ? ' ' :''
            }
            if( text ){
                if( !inPre && whitespaceOption === 'condense' ){
                    console.log(333)
                }
                let res,child
                //将标签里面的文本 搞出来 带有空格
                //@todo type 的意义
                if( !inVPre && text !== ' ' && (res = parseText(text,delimiters)) ){
                    child = {
                        type:2,
                        expression:res.expression,
                        tokens:res.tokens,
                        text:text
                    }
                }else if( text !== ' ' || children.length || children[children.length - 1].text !== ' ' ){
                    child = {
                        type : 3,
                        text : text
                    }
                }
                if( child ){
                    //当成测试环境 将 start 跟 end 放入
                    child.start = start
                    child.end = end
                    children.push(child)
                }
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
                // console.log('这是注释')

                currentParent.children.push(child)
            }
        }
    })

    return root
}

function isTextTag(el){
    return el.tag === 'script' || el.tag ==='style'
}
function parseText(text,delimiters){
    //正则
    let tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
    if( !tagRE.test(text) ){
        return
    }

    let tokens=[],rawTokens =[]
    let lastIndex = tagRE.lastIndex = 0
    let match,index,tokenValue

    //检索字符串的正则表达式匹配
    while( (match =tagRE.exec(text) ) ){
        index = match.index
        //带有空格
        if( index > lastIndex ){
            rawTokens.push(tokenValue =text.slice(lastIndex,index) )
            tokens.push(JSON.stringify(tokenValue))
        }
        //{{}} 里面的 变量名称
        let exp = parseFilters(match[1].trim())
        //_s(exp) 用它来标记吗？
        tokens.push(( `_s(${exp})` ))
        rawTokens.push({ '@binding':exp })
        lastIndex = index + match[0].length
    }
    if( lastIndex < text.length ){
        rawTokens.push(tokenValue = text.slice(lastIndex))
        tokens.push(JSON.stringify(tokenValue))
    }
    return {
        expression : tokens.join('+'),
        tokens : rawTokens
    }
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
    //
    let element = el
    //这里没有吧 v-if 从 attrMap中移除
    let exp = getAndRemoveAttr(el,'v-if')
    if( exp ){
        //if的表达式
        //每次循环都走到这 这还是有点问题 打静态标记的时候 这出问题了
        //误会了 optimizer 里面 判断if 的 从1 开始
        el.if = exp
        addIfCondition(el,{
            exp:exp,
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
    //将:key 从 attrsList 中 删除 并 挂载到 el 中
    processKey(el)

    // determine whether this is a plain element after
    // removing structural attributes
    //for
    el.plain = (
        !el.key &&  !el.scopedSlots && !el.attrsList.length
    )
    //标签上是否有 ref 有的时候 在去 判断是否有 v-for
    processRef(el)
    //slot  el.slotScope
    processSlotContent(el)
    // <slot /> 标签 name 挂载到el 中 slotName
    processSlotOutlet(el)
    //is=xx 动态组件 el.component = xx
    //inline-template 内联组件 el.inlineTemplate = true
    processComponent(el)

    //@todo 不知道干啥
    // for( let i=0;i < transforms.length;i++ ){
    //     el = transforms[i](el,options) || el
    // }
    processAttrs(el)
    return el
}
//将:key 从 attrsList 中 删除 并 挂载到 el 中
function processKey(el){
    //标签里面 含有 key = 1 exp返回1
    //:key=xxx v-bind:key=xxx
    //获取 标签中 存在 key 的情况 并 exp 为 = 后面的值
    let exp = getBindingAttr(el,'key')
    if( exp ){
        {
            if( el.tag === 'template' ){
                console.warn(`<template> cannot be keyed. Place the key on real elements instead.${getAndRemoveAttr(el,'key')}`)
            }
            //for
            if( el.for ){
                let iterator = el.iterator1 || el.iterator2
                //undefined
                let parent = el.parent
                if( iterator && iterator === exp && parent && parent.tag === 'transition-group' ){
                    console.warn(`
                        "Do not use v-for index as key on <transition-group> children, "
                        "this is the same as not using keys.",
                        ${getRawBindingAttr(el, 'key')},
                        true /* tip */
                    `)
                }
            }
        }
        el.key = exp
    }
}

//ref 属性
function processRef(el){
    let ref = getBindingAttr(el,'ref')
    if( ref ){
        el.ref = ref
        //ref 跟 v-for 是否 共存
        el.refInFor = checkInFor(el)
    }
}
//v-for 跟 ref 共存的时候 用 refInFor true
function checkInFor(el){
    let parent = el
    while (parent){
        if( parent.for !== undefined ){
            return true
        }
    }
    return false
}

// handle content being passed to a component as slot,
// e.g. <template slot="xxx">, <div slot-scope="xxx">
function processSlotContent(el){
    let slotScope
    if( el.tag === 'template' ){
        slotScope = getAndRemoveAttr(el,'scope')
        //非生产环境 提示 移除了 scope
        console.warn(`
            "the "scope" attribute for scoped slots have been deprecated and "
            "replaced by "slot-scope" since 2.5. The new "slot-scope" attribute "
            "can also be used on plain elements in addition to <template> to "
            "denote scoped slots.",
            ${el.rawAttrsMap['scope']}
        `)
        el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
    } else if ( (slotScope = getAndRemoveAttr(el,'slot-scope') ) ){
        //
        if( el.attrsMap['v-for'] ){
            console.warn(`
                "Ambiguous combined usage of slot-scope and v-for on <" + ${el.tag} + "> " +
                "(v-for takes higher priority). Use a wrapper <template> for the " +
                "scoped slot to make it clearer.",
                ${el.rawAttrsMap['slot-scope']},
            `)
        }
        el.slotScope = slotScope
    }

    // slot :slot v-bind:slot = xxx
    let slotTarget = getBindingAttr(el,'slot')
    if( slotTarget ){
        el.slotTarget = slotTarget==='""' ? "default" : slotTarget
        el.slotTargetDynamic = !!(el.attrsMap[':slot']) || el.attrsMap['v-bind:slot']
        // preserve slot as an attribute for native shadow DOM compat
        // only for non-scoped slots.
        if( el.tag !== 'template' && !el.slotScope ){
            addAttr(el,'slot'.slotTarget,getBindingAttr(el,'slot'))
        }
    }

    //2.6 用 v-slot  @todo 临时省略 以后 在写
    {

    }
}

// <slot />
function processSlotOutlet(el){
    if( el.tag === 'slot'){
        //slot name
        el.slotName = getBindingAttr(el,'name')
        if( el.key ){
            console.warn(`
                "'key' does not work on <slot> because slots are abstract outlets " +
                "and can possibly expand into multiple elements. " +
                "Use the key on a wrapping element instead.",
            `)
        }
    }
}

//动态组件 is inline-template
function processComponent(el){
    let binding
    if( ( binding = getBindingAttr(el,'is') ) ){
        el.component = binding
    }
    //内联模版 inline-template
    if( getAndRemoveAttr(el,'inline-template') != null ){
        el.inlineTemplate = true
    }
}

// 标签上的 各个属性
function processAttrs(el){
    //属性 list
    let list = el.attrsList
    let i,l,name,rawName,value,modifiers,syncGen,isDynamic
    for( i = 0,l = list.length; i < l ; i++ ){
        name = rawName = list[i].name
        value = list[i].value
        //vue 标签的 vue属性 : @ v-
        if( dirRE.test(name) ){
            //将元素标记为动态
            el.hasBindings = true
            modifiers = parseModifiers(name.replace(dirRE,''))
            // support .foo shorthand syntax for the .prop modifier
            //v-bind.a v-bind:a.b
            if( modifiers ){
                name = name.replace(modifierRE,'')
            }
            // v-bind:
            if( bindRE.test(name) ){
                name = name.replace(bindRE,'')
                value = parseFilters(value)
                //v-bind:[cc.C].sync="cC" ture 有中括号
                isDynamic = dynamicArgRE.test(name)
                if( isDynamic ){
                    name = name.slice(1,-1)
                }
                //v-bind 为空是不行的 warn
                if( value.trim().length ===0 ){
                    console.warn("The value for a v-bind expression cannot be empty. Found in \"v-bind:" + name + "\"")
                }
                //v-bind:a.b v-bind:a的时候不走这儿
                //v-bind .sync .prop .camel
                if( modifiers ){
                    //https://segmentfault.com/a/1190000016786254
                    // prop v-bind:aa.prop="aa"
                    if( modifiers.prop && !isDynamic ){
                        name = camelize(name)
                        if( name === 'innerHTML'){
                            name = 'innerHTML'
                        }
                    }
                    //camel v-bind:bb.camel="bb"
                    //.camel修饰符允许在使用DOM模板时将v-bind属性名称驼峰化，
                    //.camel-(2.1.0+)将kebab-case特性名转换为camelCase.(从2.1.0开始支持)
                    if( modifiers.camel && !isDynamic  ){
                        name = camelize(name)
                    }
                    //sync 对prop进行双向绑定
                    //父组件向子组件传值 同时子组件触发方法 需要修改父组件传递过来的数据
                    //使用sync的时候，子组件传递的事件名必须为update:value，其中value必须与子组件中props中声明的名称完全一致(如上例中的myMessage，不能使用my-message)
                    //注意带有 .sync 修饰符的 v-bind 不能和表达式一起使用 (例如 v-bind:title.sync=”doc.title + ‘!’” 是无效的)。取而代之的是，你只能提供你想要绑定的属性名，类似 v-model。
                    //将 v-bind.sync 用在一个字面量的对象上，例如 v-bind.sync=”{ title: doc.title }”，是无法正常工作的，因为在解析一个像这样的复杂表达式的时候，有很多边缘情况需要考虑。
                    if (modifiers.sync) {
                        //v-bind:cc.sync="cC" false
                        //v-bind:[cc.C].sync="cC" ture 有中括号
                        //子组件通过 this.$emit('update:cc',params) 父组件 通过 :cc.sync = xxx
                        if( !isDynamic ){
                            syncGen = genAssignmentCode(value,"$event")
                            //实现绑定
                            // addHandler(el, ("update:"+(camelize(name))), syncGen,null,false,list[i])
                        }else{

                        }
                        console.log('modifiers.sync-------->',name,value,isDynamic)
                    }

                }

            }else if( onRE.test(name) ){
                //上面将click.xx 后面的点 去掉了
                //v-on 或 @click
                //将 @ 去除
                name = name.replace(onRE,'')
                // v-on:click.prevent false name -> click
                //v-on:[click.prevent] true name->click.prevent
                isDynamic = dynamicArgRE.test(name)
                if( isDynamic ){
                    name = name.slice(1,-1)
                }
                //将事件 绑定修饰符
                addHandler(el,name,value,modifiers,false,list[i],isDynamic)
            }else{
                //正常指令 不包括v-if v-for 已经处理过了 processIf
                //v-text v-html v-model v-show
                name = name.replace(dirRE,'')
                //解析参数
                let argMatch = name.match(argRE)
                let arg = argMatch && argMatch[1]
                isDynamic = false
                //没有这么用过啊
                if( arg ){
                    name = name.slice(0,-(arg.length +1))
                    if( dynamicArgRE.test(arg) ){
                        arg = arg.slice(1,-1)
                        isDynamic = true
                    }
                }
                //directives 自定义指令相关的 东西
                addDirective(el,name,value,arg,isDynamic,modifiers,list[i])
                //v-model 跟 v-for 不能同时使用 检查 v-model
                if( name === 'model' ){
                    checkForAliasModel(el,value)
                }
            }
        }else{
            //不是vue 的属性 如 id class style title href
            //块级作用域
            {
                let res = parseText(value,delimiters)
                if( res ){
                    console.warn(
                        name + "=\"" + value + "\": " +
                        'Interpolation inside attributes has been removed. ' +
                        'Use v-bind or the colon shorthand instead. For example, ' +
                        'instead of <div id="{{ val }}">, use <div :id="val">.',
                            list[i]
                    );
                }
            }
            addAttr(el,name,JSON.stringify(value),list[i])
            // firefox doesn't update muted state if set via attribute
            // even immediately after element creation
            if( !el.component && name === 'muted' && platformMustUseProp(el.tag, el.attrsMap.type, name) ){
                addProp(el,name,'true',list[i])
            }
        }
    }
}

function parseModifiers(name){
    //name值 v-bind:click->bind:click @:click->:click
    let match = name.match(modifierRE)
    if( match ){
        let ret = {}
        match.forEach((m)=>{
            ret[ m.slice(1) ]= true
        })
        return ret
    }
}

function genAssignmentCode(value,assignment){
    let res = parseModel(value)
    console.log(res,99999)
}
let len

// Fix https://github.com/vuejs/vue/pull/7730
// allow v-model="obj.val " (trailing whitespace)
function parseModel(val){
    val = val.trim()
    len = val.length

}

/**
 * @param el              整个节点
 * @param name            类似 click
 * @param value           click=value
 * @param modifiers
 * @param important
 * @param range           单个节点
 * @param dynamic
 * **/
//click 绑定的事件 修饰符
function addHandler(el,name,value,modifiers,important,range,dynamic){
    /*
    *  modifiers 几种情况                                           dynamic
    *       v-on:click.prevent   {prevent: true}                    true
    *       v-on:[click.prevent]   undefined                        true
    *       v-on:click  undefined                                   false
    *       v-on:[click,dd]或者v-on:[click]   undefined              true
    * */
    modifiers = modifiers || emptyObject
    if( modifiers.prevent && modifiers.passive ){
        console.warn(`passive and prevent can't be used together. Passive handler can't prevent default event`)
    }

    // normalize click.right and click.middle since they don't actually fire
    // this is technically browser-specific, but at least for now browsers are
    // the only target envs that have right/middle clicks.
    //右键
    //click.right
    if( modifiers.right ){
        if( dynamic ){
            name = `(${name})==='click'?'contextmenu':(${name})`
        }else if(name === 'click'){
            name = 'contextmenu'
            delete modifiers.right
        }
    }else if( modifiers.middle ){
        //click.middle
        //滚轮
        if( dynamic ){
            name = `(${name}) === 'click'?'mouseup':(${name})`
        }else if(name === 'click'){
            name = 'mouseup'
        }
    }
    //click.capture 冒泡排序
    if( modifiers.capture){
        delete modifiers.capture
        //name -> !click 或者 _p(click,!)
        name = prependModifierMarker('!',name,dynamic)
    }

    //click.once
    if( modifiers.once ){
        delete modifiers.once
        name = prependModifierMarker('~',name,dynamic)
    }
    //istanbul ignore if
    //click.passive 执行默认方法
    if( modifiers.passive ){
        delete modifiers.passive
        name = prependModifierMarker('&',name,dynamic)
    }

    let events;
    //click.native  父组件中给子组件绑定一个原生的事件 将子组件变成了普通的html标签
    //将vue组件转为普通的html标签，并且对普通html标签没有任何作用
    if( modifiers.native ){
        delete modifiers.native
        events = el.nativeEvents || (el.nativeEvents={})
    }else{
        events = el.events || (el.events = {})
    }
    //将click事件对应的名称 添加 start end
    let newHandler = rangeSetItem({
        value:value.trim(),
        dynamic
    },range)

    //冻结
    if( modifiers !== emptyObject ){
        newHandler.modifiers = modifiers
    }

    let handlers = events[name]
    if(Array.isArray(handlers)){
        important ? handlers.unshift(newHandler) : handlers.push(newHandler);
    }else if(handlers){
        events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
    }else{
        events[name] = newHandler
    }

    el.plain = false
}

function prependModifierMarker(symbol,name,dynamic){
    return dynamic
        ? ("_p(" + name + ",\"" + symbol + "\")")
        : symbol + name
}
//将click事件对应的名称 添加 start end
function rangeSetItem(item,range){
    //{name: "v-on:click.native", value: "tag", start: 53, end: 76}
    if( range ){
        //一直当测试环境 所以都添加了 start跟end
        if( range.start != null ){
            item.start = range.start
        }
        if( range.end != null ){
            item.end = range.end
        }
    }
    return item
}

//directives 自定义指令相关的
function addDirective(el,name,rawName,value,arg,isDynamicArg,modifiers,range){
    (el.directives || (el.directives = [])).push(rangeSetItem({
        name: name,
        rawName: rawName,
        value: value,
        arg: arg,
        isDynamicArg: isDynamicArg,
        modifiers: modifiers
    }, range));
    el.plain = false;
}
//v-model 节点 跟 v-model = value
function checkForAliasModel(el,value){
    let _el = el
    while (_el){
        if( _el.for && _el.alias === value ){
            console.warn(`
                <${el.tag}> v-model=${value}
                "You are binding v-model directly to a v-for iteration alias. "
                "This will not be able to modify the v-for source array because "
                "writing to the alias is like modifying a function local variable. "
                "Consider using an array of objects and use v-model on an object property instead.",
            `)
        }
        _el = _el.parent
    }
}

function addProp (el, name, value, range, dynamic) {
    (el.props || (el.props = [])).push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
    el.plain = false;
}

//当template里面存在 v-else 或者 v-else-if
//@todo 回头将 if 这 在搞搞
function processIfConditions(el,parent){

    let prev = findPrevElement(parent.children)
    if( prev && prev.if ){
        addIfCondition(prev,{
            exp: el.elseif,
            block:el
        })
    }else{
        //就是测试环境
        console.warn("v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
            "used on element <" + (el.tag) + "> without corresponding v-if.",
            el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else'])
    }
}
function findPrevElement(children){
    let i = children.length
    while ( i-- ){

        if (children[i].type === 1) {
            return children[i]
        } else {
            //中间有注释的时候 也不行 看来还有后续操作
            if (children[i].text !== ' ') {
                console.warn(`
                    text  '(${children[i].text.trim()})' between v-if and v-else(-if)  will be ignored.
                `)
            }
            children.pop();
        }

    }
}
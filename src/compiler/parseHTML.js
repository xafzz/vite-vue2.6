
/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
//直接复制了
//用于分析 标记 和 属性 的 正则表达式
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
//source 用于返回模式匹配所用的文本
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// 开始标签部分，不包含开始标签的结尾。如 <div class="className" ></div>，匹配的是 '<div class="className"' 开始标签
const startTagOpen = new RegExp(`^<${qnameCapture}`)
//开始标签的结尾部分。如 <div class="className" ></div>，匹配的是 ' >'
const startTagClose = /^\s*(\/?)>/
// '</div><p></p>' 匹配结果为 </div> 是否是结束标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
// 匹配 DOCTYPE
const doctype = /^<!DOCTYPE [^>]+>/i
// to avoid being passed as HTML comment when inlined in page
//注释
const comment = /^<!\--/;
//匹配条件注释 <!--[if gte IE 6]>
const conditionalComment = /^<!\[/;
// Special Elements (can contain anything) 处理特殊标签
const isPlainTextElement = makeMap('script,style,textarea',true)

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true);
const shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };

const isUnaryTag = makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
)


function makeMap(str,expectsLowerCase){
    let map = Object.create(null)
    let list = str.split(',')
    for (let i=0 ;i<list.length ;i++){
        map[ list[i] ] = true
    }

    return expectsLowerCase
        //为什么要转成小写
        ? function (val) { return map[val.toLowerCase()] }
        : function (val) { return map[val] }
}

export default function parseHTML(html, options) {
    // console.log(html,options)
    //options 还是空

    const stack = []
    let index = 0
    let last , lastTag;
    // 截取 html 模版字符串，并根据截取的字符串类型，触发相应钩子函数
    while (html){
        last = html
        if (!lastTag || !isPlainTextElement(lastTag)){
            //第一个是 <  注释 条件注释 开始标签 结束标签
            //设计的太漂亮了 根据 < 位置 将注释的搞掉 其他的都是标签
            // 当textEnd 为0 的时候 意味这 一个新的标签开始 当然我们的回车 空格 都被计算在内了
            //让我想起了 tab 4个 跟 2个的区别
            let textEnd = html.indexOf('<')
            if( textEnd === 0 ){
                //判断是否有注释
                if( comment.test(html) ){
                    // 拿到结尾的位置
                    let commentEnd = html.indexOf('-->')
                    if( commentEnd > 0 ){
                        // console.log(commentEnd)
                        //这还有一个判断 因为没有设置options 暂时跳过
                        //html是剩余的内容 并且进到这里已经是注释的 部分
                        //4是因为 <!-- 4个字符
                        //3是因为 --> 3个字符
                        //index 是0
                        options.comment(html.substring(4,commentEnd),index,index+commentEnd+3)
                        advance( commentEnd +3 )
                        //经过这个处理 将注释部分 直接 跳过了
                        //注释这块结束
                        continue
                    }
                }
                //条件渲染
                // https://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
                //<![if IE 10]>
                //<div>IE 10</div>
                //<![endif]>
                // <!--[if gte IE 8]>
                //<div>1111</div>
                //<![endif]-->   都没有匹配出来
                if( conditionalComment.test(html) ){
                    let conditionalEnd = html.indexOf(']>')

                    if( conditionalEnd > 0 ){
                        advance( conditionalEnd + 2 )
                        continue
                    }
                }

                // Doctype:
                let doctypeMatch = html.match(doctype)
                if( doctypeMatch ){
                    advance(doctypeMatch[0].length)
                    continue
                }

                //开始标签
                // Start tag:
                let startTagMatch = parseStartTag()
                /**
                     attrs: [Array(6)]
                     end: 18
                     start: 0
                     tagName: "div"
                     unarySlash: ""
                */
                if( startTagMatch ){
                    //从这跳到钩子函数 start 处理标签
                    handleStartTag(startTagMatch)
                    //pre,textarea /n
                    if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
                        advance(1);
                    }
                    continue
                }


                //结束标签

                console.log('还没有跳出去->' + index++,startTagMatch)
            }
            /*//处理内容？
            let text = (void 0) ,rest = (void 0), next = (void 0)
            // 判断 '<' 首次出现的位置，如果大于等于0，截取这段，赋值给text, 并删除这段字符串
            // 这里有可能是空文本，如这种 ' '情况， 他将会在chars里面处理
            if( textEnd >= 0 ){
                rest = html.slice(textEnd)
                //文本里面包含
                //判断 < 不是后面的情况 汉字就可以了 空格也走到这
                while (
                    !endTag.test(rest) &&            //是否是结束标签
                    !startTagOpen.test(rest) &&      //是否开始标签
                    !comment.test(rest) &&           //是否注释
                    !conditionalComment.test(rest)   //条件注释
                ){
                    // < 存在纯文本中 将  < 作为纯文本
                    next = rest.indexOf('<',1)
                    if( next < 0){
                        break
                    }
                    textEnd += next
                    rest = html.slice(textEnd)
                }
                text = html.substring(0,textEnd)
            }
            //最后一个闭合标签 最后一个整体结束的标签
            //没有，则整个都是文本
            if( textEnd < 0 ){
                text = html
            }
            // 截取
            if( text ){
                advance(text.length)
            }

            //调用 chars 钩子 处理文本标签
            if(options.chars && text){
                options.chars(text,index - text.length,index)
            }*/
        }else{
            console.log(2,2,html)
        }

        // advance(index)
        let nextIndex = index + 1


        // console.log(nextIndex,'截取的',html.substring(index,1))
        // console.log('未截取的',html.substring(index))
        // console.log(html)
        html = html.substring(nextIndex)
    }

    function advance(n){
        index += n
        html = html.substring(n)
    }

    //调用 parseStartTag 解析开始标签，如果有
    //再调用 handleStartTag，主要是将 tagName、attrs 和 unary 等数据取出来，然后调用钩子函数将这些数据放到参数中
    function parseStartTag(){
        let start = html.match(startTagOpen)
        if(start){
            //定义解析开始标签的存储格式
            let match ={
                tagName:start[1], //标签名
                attrs:[], //属性
                start:index //标签开始的位置
            }
            //删除匹配到的字符串
            advance(start[0].length)
            //没有匹配到结束 '>' 单匹配到了属性
            let end ,attr
            // div 里面的 属性 class 之类 一个属性是 attr 数组的一个元素 从前往后
            while (
                !(end= html.match(startTagClose)) &&
                (attr = html.match(dynamicArgAttribute) ||
                html.match(attribute))
            ) {
                //将attr 属性 添加到 match
                attr.start = index
                advance(attr[0].length)
                attr.end = index
                match.attrs.push(attr)
            }
            if( end ){
                //结束到位置
                match.unarySlash = end[1]
                advance(end[0].length)
                match.end = index
                return match
            }
        }
    }

    //处理解析后的属性，重新分割并保存到attrs数组中
    function handleStartTag(match){
        let tagName = match.tagName
        let unarySlash = match.unarySlash

        //直接拷贝 并且 跳过 options 为空
        // if (expectHTML) {
        //     if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        //         parseEndTag(lastTag);
        //     }
        //     if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
        //         parseEndTag(tagName);
        //     }
        // }

        let unary = isUnaryTag(tagName) || !!unarySlash //false
        //match 里面 有几个 属性
        let l = match.attrs.length
        //根据属性的个数 创建一个空数组
        let attrs = new Array(l)
        /**
             0: "  class="main""
             1: "class"
             2: "="
             3: "main"
             4: undefined
             5: undefined
             end: 18
             groups: undefined
             index: 0
             input: "  class="main" style="background: red">↵   ......."
             start: 4
         **/
        for (let i =0; i<l ;i++){
            let args = match.attrs[i]
            //拿到属性的值
            let value = args[3] || args[4] || args[5] || ''
            attrs[i]={
                name:args[1],
                value:value
            }
            //设置开始 结束值
            // if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {}
            attrs[i].start = args.start + args[0].match(/^\s*/).length
            attrs[i].end = args.end
        }
        //非单元素
        if( !unary ){
            //parse 深度 有限 遍历
            //用stack 保存还闭合的标签的父子关系
            //标签结束是 一个个pop出来
            stack.push({
                tag:tagName,
                lowerCasedTag: tagName.toLowerCase(),
                attrs:attrs,
                start:match.start,
                end:match.end
            })
            lastTag = tagName
        }
        if( options.start ){
            options.start(tagName,attrs,unary,match.start,match.end)
        }
    }
}




























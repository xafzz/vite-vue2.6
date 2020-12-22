import parseFilters from "./filter-parser.js";
import {
    cached
} from "../helpers.js";

//双花括号
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

const buildRegex = cached((delimiters)=>{
    let open = delimiters[0].replace(regexEscapeRE,'\\$&')
    let close = delimiters[1].replace(regexEscapeRE,'\\$&')
    return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

export default function parseText(text,delimiters){
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
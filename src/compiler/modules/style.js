import {getAndRemoveAttr, getBindingAttr} from "../helpers.js";
import parseText from "../parse/parseTEXT.js";
import { parseStyleText } from '../../util/style.js'

//将style :style挂载到el上面
function transformNode ( el,options ){
    //拿到style=xx xx style的值
    let staticStyle = getAndRemoveAttr(el,'style')
    if( staticStyle ){
        //其实非生产环境使用的
        let res = parseText(staticStyle,options.delimiters)
        if( res ){
            console.warn(`
                style="${staticStyle}": 
                Interpolation inside attributes has been removed. 
                Use v-bind or the colon shorthand instead. For example, 
                instead of <div style="{{ val }}">, use <div :style="val">
            `)
        }
        //挂载到el到同时 将 style的值 用{}包裹起来
        el.staticStyle = JSON.stringify(parseStyleText(staticStyle))
    }

    let styleBinding = getBindingAttr(el, 'style', false /* getStatic */)
    if (styleBinding) {
        el.styleBinding = styleBinding
    }
}

function getData( el ){
    console.log(el)
}


export default {
    staticKeys:['staticStyle'],
    transformNode,
    getData
}
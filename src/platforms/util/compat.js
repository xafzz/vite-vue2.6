
import {inBrowser} from "../../core/util";


// check whether current browser encodes a char inside attribute values
//检查当前浏览器是否在属性值内编码字符

let div
function getShouldDecode( href ){
    div = div || document.createElement('div')
    div.innerHTML = href ? `<a href="\n"/>` : `<div a="\n"/>`
    return div.innerHTML.indexOf('&#10;') > 0
}

//IE encodes newlines inside attribute values while other browsers don't
//IE在属性值内编码换行，而其他浏览器则不编码
export const shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false


// #6828: chrome encodes content in a[href]
export const shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false

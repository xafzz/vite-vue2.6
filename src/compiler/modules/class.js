
//获取class
import {getAndRemoveAttr, getBindingAttr} from "../helpers.js";
import parseText from "../parse/parseTEXT.js";

//拿到class 跟 ：class 并挂载到el上
function transformNode(el, options ){
    //拿到class=xx xx class的值
    let staticClass = getAndRemoveAttr(el,'class')
    if( staticClass ){
        //其实非生产环境使用的
        let res = parseText(staticClass,options.delimiters)
        if( res ){
            console.warn(`
                class="${staticClass}":
                Interpolation inside attributes has been removed.
                Use v-bind or the colon shorthand instead. For example, 
                instead of <div class="{{ val }}">, use <div :class="val">
            `)
        }

        el.staticClass = JSON.stringify(staticClass)
    }
    //通过bind 设置 class
    const classBinding = getBindingAttr(el,'class',false /* getStatic */)
    if( classBinding ){
        el.classBinding = classBinding
    }
}

//果然generate 用到这了
// generate.js genData() 函数里面用到了
function genData(el){
    let data = ''
    //分别对应上文中的 transformNode()
    //class
    if ( el.staticClass ){
        data += `staticClass:${el.staticClass},`
    }
    if( el.classBinding ){
        data += `class:${el.classBinding},`
    }
    return data
    // console.log('generate 才用吧')
}

export default {
    staticKeys:['staticClass'],
    transformNode,
    genData
}
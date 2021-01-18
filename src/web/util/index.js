

export * from './element.js'
export * from './attrs.js'
export * from './class.js'


/**
 * Query an element selector if it's not an element already.
 * new VUE $mount 用到了
 */

export function query(el){
    //还有其他的
    if( typeof el === 'string' ){
        let selected = document.querySelector(el)
        if( !selected ){
            //warning 提示 同时创建 一个div
            console.warn('找不到节点：'+el)
            return document.createElement('div')
        }
        return selected
    }else{
        return el
    }
}
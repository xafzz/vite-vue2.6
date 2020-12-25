# 第四步 compile-options相关

###### new Vue的时候也有options，所以改为compile-options恰当

###### 源码：vue/src/platforms/web/compiler/options.js

    这个还是需要单独写一写，因为在compile过程都用到了


## expectHTML
    默认为true


## modules

    没有直接按源码敲一遍，后面用到到时候 在回来补上
    包括 class、model、style


## directives

    没有直接按源码敲一遍，后面用到到时候 在回来补上
    自定义指令？

## isPreTag

    export const isPreTag = (tag) => tag === 'pre'

## isUnaryTag

    isUnaryTag = makeMap(
        'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
        'link,meta,param,source,track,wbr'
    )

## mustUseProp

    mustUseProp = (tag, type, attr) =>{
        return (
            ( attr === 'value' && acceptValue(tag)) && type !== 'button' ||
            ( attr === 'selected' && tag === 'option') ||
            ( attr === 'checked' && tag === 'input' ) ||
            ( attr === 'muted' && tag === 'video' )
        )
    }

## canBeLeftOpenTag

    canBeLeftOpenTag = makeMap(
        'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
    )

## isReservedTag

    在optimize打静态标记的时候 用到了
    isReservedTag = (tag) => isHTMLTag(tag) || isSVG(tag)

## getTagNamespace

    if( isSVG(tag) ){
        return 'svg'
    }

    if( tag === 'match' ){
        return 'match'
    }

## staticKeys

    静态标记的时候 也用到了
    reduce() 方法接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值。
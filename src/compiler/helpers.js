
import parseFilters from './filter-parser.js'

// note: this only removes the attr from the Array (attrsList) so that it
// doesn't get processed by processAttrs.
// By default it does NOT remove it from the map (attrsMap) because the map is
// needed during codegen.
function getAndRemoveAttr(el,name,removeFromMap){
    let val
    //val = 后面的值
    if( (val = el.attrsMap[name]) != null){
        let list = el.attrsList
        for( let i=0,len=list.length;i<len;i++ ){
            if( name === list[i].name ){
                //splice 删除或添加数组的中的元素
                //删除指定 i 的元素
                list.splice(i,1)
                break
            }
        }
    }
    if( removeFromMap ){
        delete el.attrsMap[name]
    }

    // console.log(val,name)
    return val
}

//getStatic  boolean
function getBindingAttr(el,name,getStatic){
    let dynamicValue = getAndRemoveAttr(el,':'+name) || getAndRemoveAttr(el,'v-bind:'+name)
    //存在 :key="xxx"  dynamicValue 为 xxx
    //存在 v-bind:key="xxx"  dynamicValue 为 xxx
    if( dynamicValue != null ){
        //todo 直接复制过来了
        return parseFilters(dynamicValue)
    }else if( getStatic !== false){
        //一种情况  key="1"
        let staticValue = getAndRemoveAttr(el,name)
        if( staticValue != null ){
            return JSON.stringify(staticValue)
        }
    }
}


function getRawBindingAttr (el, name) {
    return el.rawAttrsMap[':' + name] ||
        el.rawAttrsMap['v-bind:' + name] ||
        el.rawAttrsMap[name]
}

function addAttr(el,name,value,range,dynamic){
    let attrs = dynamic
        ? ( el.dynamicAttrs || ( el.dynamicAttrs = [] ) )
        : ( el.attrs || (el.attrs = []) )
    attrs.push(rangeSetItem(
        {name,value,dynamic},
        range
        ))
    el.pain = false
}

function rangeSetItem(item,range){
    if( range ){
        if( range.start !=null ){
            item.start = range.start
        }
        if( range.end != null ){
            item.end = range.end
        }
    }
    return item
}

export {
    getAndRemoveAttr,
    getBindingAttr,
    getRawBindingAttr,
    addAttr
}



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
    if( dynamicValue != null ){
        console.log(dynamicValue,222)
    }else if( getStatic !== false){
        //一种情况  key="1"
        let staticValue = getAndRemoveAttr(el,name)
        if( staticValue != null ){
            return JSON.stringify(staticValue)
        }
    }
}


export {
    getAndRemoveAttr,
    getBindingAttr
}
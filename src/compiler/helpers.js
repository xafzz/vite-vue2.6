
import parseFilters from './parse/filter-parser.js'

//冻结的值 热然可以将变量的引用替换掉
//冻结数据 纯展示大数据 都可以使用 Object.freeze 提高性能
const emptyObject = Object.freeze({})

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

    // console.log(val,name,removeFromMap)
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

/**
 * Create a cached version of a pure function.
 * 这也是一个高阶函数
 *  @todo 需要好好理解下
 */
function cached (fn) {
    let cache = Object.create(null);
    // 返回函数 函数中使用了外部的cache ----闭包
    return (function cachedFn (str) {
        let hit = cache[str];
        return hit || (cache[str] = fn(str))
    })
}
/**
 * 这个一块看看吧
 * @todo 下下
 * */
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

//add a raw attr (use this in preTransforms)
function addRawAttr(el,name,value,range){
    el.attrsMap[name] = value
    el.attrsList.push(rangeSetItem({ name, value }, range))
}


function addProp(el,name,value,range,dynamic){
    (el.props || (el.props = [])).push(rangeSetItem({ name, value, dynamic }, range))
    el.plain = false
}


function pluckModuleFunction (modules,key){
    return modules
        ? modules.map(m=>{
            return m[key]
        }).filter(_=>_) //filter 创建一个新的数组，新数组中的元素是通过检查制定的数组中的符合条件的所有元素
        : []
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


export {
    getAndRemoveAttr,
    getBindingAttr,
    getRawBindingAttr,
    addAttr,
    cached,
    makeMap,
    addProp,
    addRawAttr,
    pluckModuleFunction,
    addHandler
}
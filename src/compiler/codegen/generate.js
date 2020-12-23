
//pluckModuleFunction 移到helper里面
import {
    pluckModuleFunction
} from "../helpers.js";
import {
    no,extend,noop
} from "../../shared/util.js";

//这难道是 v-on ？
function on( el,dir ){
    console.log('this on')
    if( dir.modifiers ){
        console.warn('v-on without argument does not support modifiers. 不带参数的v-on 不支持修饰符')
    }
    //这个属性干啥子的 todo
    el.wrapListeners = code => `_g(${code},${dir.value})`
    // el.wrapListeners = function (code) { return ("_g(" + code + "," + (dir.value) + ")"); };
}
//v-bind?
function bind( el,dir ){
    console.log('this bind')
    el.wrapData = code => `_b(${code},'${el.tag}',${dir.value},${ dir.modifiers && dir.modifiers.prop ? 'true' : 'false' } ${ dir.modifiers && dir.modifiers.sync ? 'true' :'' })`
    //{return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")}
}


const baseDirectives = {
    on : on,
    bind : bind,
    cloak : noop
}

const CodegenState = function CodegenState(options){
    this.options = options;
    //warn 直接写了 没有封装
    // this.warn = options.warn || baseWarn;
    //木有这个函数
    this.transforms = pluckModuleFunction(options.modules,'transformCode')
    //src/compiler/modules/class.js 终于来了
    this.dataGenFns = pluckModuleFunction(options.modules,'genData')
    //自定义指令
    this.directives = extend( extend({},baseDirectives),options.directives )
    //tag
    const isReservedTag = options.isReservedTag || no
    this.maybeComponent = (el) => !!el.component || !isReservedTag(el.tag)
    this.onceId = 0;
    this.staticRenderFns = [];
    this.pre = false;
}

//hoho 这个好少代码 激动。。
//我靠 好绕
export default function generate( ast,options ){

    let state = new CodegenState(options)
    let code = ast ? genElement( ast,state ) : '_c("div")'

    return {
        //vue2 用 with(this)
        render : ("with(this){return "+ code +"}"),
        staticRenderFns : state.staticRenderFns
    }
}
// el 就是 ast
// options 是上面 CodegenState 生成的 跟 parse/optimize 不一样
function genElement( el,state ){
    //正常情况是没有的 如果有的话 就相当于是 v-pre 了
    //todo 哪种时候不知道
    if( el.parent ){
        console.log('hoho 有了 el.parent----->',el.parent)
        el.pre = el.pre || el.parent.pre
    }

    //el.staticProcessed  是在 genStatic 里面加的
    if( el.staticRoot && !el.staticProcessed ){ //静态根节点
        /**
         满足静态根节点的前提下
         只有包含 class 或者 style 或者 <div></div> 空标签就是 静态根节点,有id的时候 就不是静态根节点
         <div class="main" style="background: red">
             <h1>
                这是标题
                <p>ddd</p>
                <span>ddd</span>
             </h1>
         </div>
         */
        return genStatic(el, state)
    }else if( el.once && !el.onceProcessed ){ // v-once
        /**
         *
         <div class="main" v-once v-if="show" style="background: red">
             <h1>
                这是标题
                <p v-pre >ddd</p>
                <span >ddd</span>
             </h1>
         </div>
         */
        return genOnce( el,state )
    }else if( el.for && !el.forProcessed ){
        /**
         *
         <div class="main" v-for="item in 5"  style="background: red">
             <h1 v-once v-for="item in 10">
                 这是标题
                 <p v-if="show" >ddd</p>
                 <span >ddd</span>
             </h1>
         </div>
         */
        return genFor( el,state )
    }else if( el.if && !el.ifProcessed ){
        //<div class="main" v-if="1" style="background: red">
        return genIf(el,state)
    }else if(el.tag === 'template' && !el.slotTarget && !state.pre) {
        console.log("el.tag === 'template' && !el.slotTarget && !state.pre")
    }else if(el.tag === 'slot'){
        console.log("el.tag === 'slot'")
    }else{
        let code
        //这是组件吗
        if( el.component ){
            console.log('component，这是组件吗')
        }else{
            let data
            if( !el.plain || ( el.pre && state.maybeComponent(el) ) ){
                //这个NB了
                data = genData(el,state)
            }
        }
        console.log(11)
    }

}

//静态根节点
function genStatic( el,state ){
    el.staticProcessed = true
    // Some elements (templates) need to behave differently inside of a v-pre
    // node.  All pre nodes are static roots, so we can use this as a location to
    // wrap a state change and reset it upon exiting the pre node.
    let originalPreState = state.pre
    if( el.pre ){
        state.pre = el.pre

    }
    state.staticRenderFns.push( `with(this){ return ${genElement(el,state)} }` )
    state.pre = originalPreState
    // todo 怎么可能会有 staticInFor
    return ("_m("+ ( state.staticRenderFns.length -1 ) + ( el.staticInFor ? ',true' : '') +")")
}

// v-once
function genOnce( el,state ){
    el.onceProcessed = true
    // <div class="main" v-once v-if="show" style="background: red">
    if( el.if && !el.ifProcessed ){
        return genIf( el,state )
    } else if( el.staticInFor ){
        // todo 递归的话应该能走到这儿
        console.log('没有走到-------->for')
    }else{
        return genStatic(el,state)
    }
}

function genIf( el,state,altGen,altEmpty ){
    //避免递归
    el.ifProcessed = true
    return genIfConditions( el.ifConditions.slice() ,state,altGen,altEmpty )
}
//
function genIfConditions( conditions,state,altGen,altEmpty ){
    //不为空啊 没有表达式 返回空
    if( !conditions.length ){
        return altEmpty || '_e()'
    }
    //拿到第一个值
    let condition = conditions.shift()
    if( condition.exp ){
        let ret = ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
        // console.log('到底打印了个啥------>',ret)
        return ret
    }else{
        return ("" + (genTernaryExp(condition.block)))
    }

    // v-if with v-once should generate code like (a)?_m(0):_m(1)
    function genTernaryExp(el) {
        return altGen
            ? altGen(el, state)
            : el.once
                ? genOnce(el, state)
                : genElement(el,state)
    }
}
//v-for="(item,key,index) in 5"
function genFor( el,state,altGen,altHelper ){
    let exp = el.for
    let alias = el.alias
    let iterator1 = el.iterator1 ? ("," + (el.iterator1)) : ''
    let iterator2 = el.iterator2 ? ("," + (el.iterator2)) : ''

    if( state.maybeComponent(el) && el.tag !== 'slot' && el.tag !== 'template' && !el.key ){
        console.warn(
            "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
            "v-for should have explicit keys. " +
            "See https://vuejs.org/guide/list.html#key for more info."
        )
    }

    //避免递归
    el.forProcessed = true
    return ( altHelper || '_l' ) + "((" + exp + ")," +
        "function(" + alias + iterator1 + iterator2 + "){" +
        "return " + ((altGen || genElement)(el, state)) +
        '})'
}

function genData( el,state ){
    let data = '{'

    // directives first.
    // directives may mutate the el's other properties before they are generated.
    // 优先自定义指令
    let dirs = genDirectives(el,state)
    if( dirs ){
        data += dirs + ','
    }

    /**
     *  :key="key" key="dd"  key
     *  :key="key"  key
     *  key="dd"    "dd"
     */
    if( el.key ){
        data += "key:" + (el.key) + ","
    }
    /**
     *  ref="dd"  "dd"
     *  :ref="dd"  dd
     */
    if( el.ref ){
        data += "ref:" + (el.ref) + ","
    }
    if (el.refInFor) {
        data += "refInFor:true,";
    }
    // pre
    if( el.pre ){
        data += "pre:true,"
    }
    // record original tag name for components using "is" attribute
    if (el.component) {
        console.log('hoho-->component')
        // data += "tag:\"" + (el.tag) + "\",";
    }
    // module data generation functions
    for (let i = 0; i < state.dataGenFns.length; i++) {
        data += state.dataGenFns[i](el);
    }
    //一个其他的属性一个元素 除了vue预存标签 class style
    if (el.attrs) {
        //attrs:{"id":"main","title":"1"},
        data += "attrs:" + (genProps(el.attrs)) + ",";
    }

    // DOM props
    if (el.props) {
        console.log('--------->props')
        // data += "domProps:" + (genProps(el.props)) + ",";
    }

    // event handlers
    /**
     * v-on
     */
    if (el.events) {
        data += (genHandlers(el.events, false)) + ",";
    }
    console.log(data)
    return data
}

//有自定义指令的时候 在放上吧 要不单纯写上理解也不深
function genDirectives( el,state ){
    let dirs = el.directives
    if( !dirs ){
        return
    }
    console.log('走到自定义指令了再回来写上')
}

/**
 * 一个其他的属性一个元素 除了vue预存标签 class style
    <div id="main" :class="dd" title="1" class="main" style="background: red;border: 1px solid red;" >
    {name: "id", value: ""main"", dynamic: undefined, start: 5, end: 14}
    {name: "title", value: ""1"", dynamic: undefined, start: 27, end: 36}
 */
// attrs:{"id":"main","title":"1"
function genProps(props) {
    let staticProps = ''
    let dynamicProps = ''

    for( let i=0,len=props.length;i<len;i++ ){
        let prop = props[i]
        //行分割符 段落分割符 替换下
        let value = transformSpecialNewlines(prop.value)
        if( prop.dynamic ){
            console.log('啥时候才有dynamic')
        }else{
            staticProps += "\"" + (prop.name) + "\":" + value + ","
        }

    }
    staticProps = "{"+ (staticProps.slice(0,-1)) +"}"
    if( dynamicProps ){

    }else{
        return staticProps
    }
}
// 行分割符 段落分割符 替换下
function transformSpecialNewlines (text) {
    return text
        .replace(/\u2028/g, '\\u2028')  //行分隔符
        .replace(/\u2029/g, '\\u2029')  //段落分隔符
}

function genHandlers( events,isNative ){
    console.log(events,isNative)
}





























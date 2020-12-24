
//pluckModuleFunction 移到helper里面
import {
    pluckModuleFunction
} from "../helpers.js";
import {
    no,extend,noop
} from "../../shared/util.js";


const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
const fnInvokeRE = /\([^)]*?\);*$/;
const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

// KeyboardEvent.keyCode aliases
//绑定 键盘 code
const keyCodes = {
    esc: 27,
    tab: 9,
    enter: 13,
    space: 32,
    up: 38,
    left: 37,
    right: 39,
    down: 40,
    'delete': [8, 46]
};

// KeyboardEvent.key aliases
// 键盘 健
const keyNames = {
    // #7880: IE11 and Edge use `Esc` for Escape key name.
    esc: ['Esc', 'Escape'],
    tab: 'Tab',
    enter: 'Enter',
    // #9112: IE11 uses `Spacebar` for Space key name.
    space: [' ', 'Spacebar'],
    // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
    up: ['Up', 'ArrowUp'],
    left: ['Left', 'ArrowLeft'],
    right: ['Right', 'ArrowRight'],
    down: ['Down', 'ArrowDown'],
    // #9112: IE11 uses `Del` for Delete key name.
    'delete': ['Backspace', 'Delete', 'Del']
};

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
const genGuard = function (condition) { return ("if(" + condition + ")return null;"); };

const modifierCode = {
    stop: '$event.stopPropagation();',
    prevent: '$event.preventDefault();',
    self: genGuard("$event.target !== $event.currentTarget"),
    ctrl: genGuard("!$event.ctrlKey"),
    shift: genGuard("!$event.shiftKey"),
    alt: genGuard("!$event.altKey"),
    meta: genGuard("!$event.metaKey"),
    left: genGuard("'button' in $event && $event.button !== 0"),
    middle: genGuard("'button' in $event && $event.button !== 1"),
    right: genGuard("'button' in $event && $event.button !== 2")
};

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
    // el.wrapData = function(code){return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")}
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
    //自定义指令 v-model
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

    //简单来说 标签里面有v-once 的都放到 staticRenderFns
    //没有的放到 render里面
    return {
        //vue2 用 with(this)
        render : ("with(this){return "+ code +"}"),
        //每当 里面有 v-once 的时候 里面就多一段
        staticRenderFns : state.staticRenderFns
    }
}
// el 就是 ast
// options 是上面 CodegenState 生成的 跟 parse/optimize 不一样
function genElement( el,state ){
    //正常情况是没有的 如果有的话 就相当于是 v-pre 了
    //递归 children 里面的元素的时候 就会有 parent
    if( el.parent ){
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

            //这是终于想起了 还有子节点啊
            //genChildren 递归子节点
            let children = el.inlineTemplate ? null : genChildren(el, state, true)
            code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")"
            // console.log('code ----------->',code)
        }

        for (let i = 0; i < state.transforms.length ; i++) {
            code = state.transforms[i](el,code)
        }
        return code
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
    // 通过递归children 判断子节点是否有 for staticInFor
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
    // 优先自定义指令 <input type="text" v-model="msg" /> v-model
    // 用 directives 包裹
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

    /*
       又用到了 parse.js addHandler
    *  modifiers 几种情况                                           dynamic         events
    *       v-on:click.prevent   {prevent: true}                    true
    *       v-on:[click.prevent]   undefined                        true
    *       v-on:click  undefined                                   false           false
    *       v-on:[click,dd]或者v-on:[click]   undefined              true
    * */
    //todo 真复杂
    if (el.events) {
        data += (genHandlers(el.events, false)) + ",";
    }
    if (el.nativeEvents) {
        data += (genHandlers(el.nativeEvents, true)) + ",";
    }
    // slot target
    // only for non-scoped slots
    if (el.slotTarget && !el.slotScope) {
        console.log('el.slotTarget && !el.slotScope')
        // data += "slot:" + (el.slotTarget) + ",";
    }

    // scoped slots
    if (el.scopedSlots) {
        console.log('el.scopedSlots')
        // data += (genScopedSlots(el, el.scopedSlots, state)) + ",";
    }
    // component v-model
    if (el.model) {
        data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
    }
    // inline-template
    if (el.inlineTemplate) {
        console.log('el.inlineTemplate')
        // var inlineTemplate = genInlineTemplate(el, state);
        // if (inlineTemplate) {
        //     data += inlineTemplate + ",";
        // }
    }

    data = data.replace(/,$/, '') + '}';

    // v-bind dynamic argument wrap
    // v-bind with dynamic arguments must be applied using the same v-bind object
    // merge helper so that class/style/mustUseProp attrs are handled correctly.
    if (el.dynamicAttrs) {
        console.log('el.dynamicAttrs')
        // data = "_b(" + data + ",\"" + (el.tag) + "\"," + (genProps(el.dynamicAttrs)) + ")";
    }
    // v-bind data wrap
    if (el.wrapData) {
        console.log('el.wrapData')
        // data = el.wrapData(data);
    }

    // v-on data wrap
    if (el.wrapListeners) {
        console.log('el.wrapListeners')
        // data = el.wrapListeners(data);
    }

    return data
}

//有自定义指令的时候 在放上吧 要不单纯写上理解也不深
function genDirectives( el,state ){
    let dirs = el.directives
    if( !dirs ){
        return
    }
    /**
     <input type="text" id="input" class="input" name="input" value="这是默认值"  v-model="msg" />
     dirs:
         {
            arg: false,
            isDynamicArg: undefined,
            modifiers:{
                end: 199,
                name: "v-model",
                start: 186,
                value: "msg",
            },
            name: "model",
            rawName: "msg",
            value: "msg",
        }
     */
    let res = 'directives:['
    let hasRuntime = false
    let i,l,dir,needRuntime
    for (i = 0; i < dirs.length; i++) {
        /**
         * dir：
             arg: false
             isDynamicArg: undefined
             modifiers: {name: "v-model", value: "msg", start: 238, end: 252}
             name: "model"
             rawName: "msg"
             value: "msg"
         */
        dir = dirs[i]
        needRuntime = true
        let gen = state.directives[dir.name]
        if( gen ){
            // compile-time directive that manipulates AST.
            // returns true if it also needs a runtime counterpart.
            //跑到  directives/model.js 里面了 v-model 挂载
            needRuntime = !!gen(el,dir)
        }
        if( needRuntime ){
            hasRuntime = true
            res += "{name:\"" +
                (dir.name) +
                "\",rawName:\"" +
                (dir.rawName) + "\"" +
                (
                    dir.value
                        ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value)))
                        : ''
                ) +
                (dir.arg
                    ? (",arg:" + (dir.isDynamicArg ? dir.arg : ("\"" + (dir.arg) + "\"")))
                    : ''
                ) +
                (
                    dir.modifiers
                        ? (",modifiers:" + (JSON.stringify(dir.modifiers)))
                        : ''
                ) +
                "},";
        }
    }
    if( hasRuntime ){
        return res.slice(0, -1) + ']'
    }
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
    let prefix = isNative ? 'nativeOn' : 'on:'
    let staticHandlers = ''
    let dynamicHandlers = ''
    /*
       又用到了 parse.js addHandler
    *  modifiers 几种情况                                           dynamic         name                modifiers
    *       v-on:click.prevent   {prevent: true}                    true           click               {prevent: true}
    *       v-on:[click.prevent]   undefined                        true           click.prevent        undefined
    *       v-on:click  undefined                                   false          click                undefined
    *       v-on:[click,dd]或者v-on:[click]   undefined              true          click,dd/click       undefined
    * */
    for (let name in events) {
        let handlerCode = genHandler(events[name])
        if (events[name] && events[name].dynamic) {
            dynamicHandlers += name + "," + handlerCode + ",";
        } else {
            staticHandlers += "\"" + name + "\":" + handlerCode + ",";
        }
    }

    staticHandlers = "{" + (staticHandlers.slice(0, -1)) + "}";
    if (dynamicHandlers) {
        return prefix + "_d(" + staticHandlers + ",[" + (dynamicHandlers.slice(0, -1)) + "])"
    } else {
        return prefix + staticHandlers
    }
}

//动手敲下总比拷贝的好
//{value: "show", dynamic: true, start: 27, end: 54}
function genHandler( handler ){
    if( !handler ){
        return 'function(){}'
    }

    if( Array.isArray(handler) ){
        return ("[" + (handler.map(function (handler) { return genHandler(handler); }).join(',')) + "]")
    }

    let isMethodPath = simplePathRE.test(handler.value)
    let isFunctionExpression = fnExpRE.test(handler.value);
    let isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));

    //@click="[tag,ss]"
    if( !handler.modifiers ){
        if( isMethodPath || isFunctionExpression ){
            return handler.value
        }
        // function($event){[tag]}
        let ret = ("function($event){" + (isFunctionInvocation ? ("return " + (handler.value)) : handler.value) + "}")
        // console.warn(ret)
        return ret
    }else{
        let code = ''
        let genModifierCode =''
        let keys=[]
        for (let key in handler.modifiers) {
            if( genModifierCode[key] ){
                genModifierCode += modifierCode[key];
                // left/right
                if (keyCodes[key]) {
                    keys.push(key);
                }

            } else if (key === 'exact') {
                let modifiers = (handler.modifiers);
                genModifierCode += genGuard(
                    ['ctrl', 'shift', 'alt', 'meta']
                        .filter(function (keyModifier) { return !modifiers[keyModifier]; })
                        .map(function (keyModifier) { return ("$event." + keyModifier + "Key"); })
                        .join('||')
                );
            }else{
                keys.push(key);
            }
        }
        //{prevent: true}  ["prevent"]
        // console.warn(keys)
        if (keys.length) {
            code += genKeyFilter(keys);
        }
        // Make sure modifiers like prevent and stop get executed after key filtering
        if (genModifierCode) {
            code += genModifierCode;
        }
        let handlerCode = isMethodPath
            ? ("return " + (handler.value) + "($event)")
            : isFunctionExpression
                ? ("return (" + (handler.value) + ")($event)")
                : isFunctionInvocation
                    ? ("return " + (handler.value))
                    : handler.value;
        return ("function($event){" + code + handlerCode + "}")
    }
}

function genKeyFilter (keys) {
    return (
        // make sure the key filters only apply to KeyboardEvents
        // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
        // key events that do not have keyCode property...
        "if(!$event.type.indexOf('key')&&" +
        (keys.map(genFilterCode).join('&&')) + ")return null;"
    )
}

function genFilterCode (key) {
    let keyVal = parseInt(key, 10);
    if (keyVal) {
        return ("$event.keyCode!==" + keyVal)
    }
    let keyCode = keyCodes[key];
    let keyName = keyNames[key];
    return (
        "_k($event.keyCode," +
        (JSON.stringify(key)) + "," +
        (JSON.stringify(keyCode)) + "," +
        "$event.key," +
        "" + (JSON.stringify(keyName)) +
        ")"
    )
}

//递归了
function genChildren( el,state,checkSkip,altGenElement,altGenNode ){
    //拿到子节点吧
    let children = el.children
    if( children.length ){
        let childEl = children[0]
        /**
             <div id="main" v title="1" class="main" style="background: red;border: 1px solid red;" >
                 <div class="top" v-for="item in 10">
                    这是一段正常的文字br
                 </div>
             </div>
             这么一段结构

             if options.whitespace = condense children.length =1
             else children.length = 2
         */
        if( children.length === 1 && childEl.for && childEl.tag !== 'template' && childEl.tag !== 'slot' ){
            // checkSkip 还有其他用到这里了 genElement() else 里面默认传的 true
            let normalizationType = checkSkip
                // maybeComponent tag 或者 component
                ? state.maybeComponent(childEl) ? ',1' : ',0'
                : ''
            return (
                "" +
                (
                    (altGenElement || genElement)(childEl, state)
                ) +
                normalizationType
            )
        }
        let normalizationType$1 = checkSkip
            ? genNormalizationType(children,state.maybeComponent)
            : 0
        //genNode node 节点 类型
        let gen = altGenNode || genNode

        return (
            "[" +
                (
                    children.map(
                        c => gen(c,state)
                    )
                ).join(',') +
            "]" +
            (
                normalizationType$1
                    ? ("," + normalizationType$1)
                    : ''
            )
        )
    }
}

// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
/**
     <div id="main" title="1" class="main" style="background: red;border: 1px solid red;" >
         <div class="top" v-for="item in 10">
            这是一段正常的文字br
         </div>
     </div>
    在这个结构下 children 是
    [ {type: 3, text: " 这是一段正常的文字br ", start: 127, end: 152, static: true} ]
 */
function genNormalizationType( children,maybeComponent ) {
    let res = 0
    for (let i = 0; i < children.length ; i++) {
        let el = children[i]
        if( el.type !== 1 ){
            continue
        }
        /**
             方法用于检测数组中的元素是否满足指定条件
             some() 方法会依次执行数组的每个元素：

             如果有一个元素满足条件，则表达式返回true , 剩余的元素不会再执行检测。
             如果没有满足条件的元素，则返回false。
             注意： some() 不会对空数组进行检测。

             注意： some() 不会改变原始数组。
         */
        if( needsNormalization(el) || ( el.ifConditions && el.ifConditions.some(c=>{ needsNormalization(c.block) }) ) ){
            /**
             <select id="input" class="input" name="input" value="这是默认值" v-if="1" v-on:click="tag"  v-model="msg" v-for="item in 10">
                <option>dd</option>
             </select>
             */
            res = 2
            break
        }
        if( maybeComponent(el) || ( el.ifConditions && el.ifConditions.some( c=> maybeComponent(c.block) ) ) ){
            console.warn('genNormalizationType------->走到这儿了')
            res = 1
        }
    }
    return res
}

function needsNormalization( el ){
    return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
}

//这不是 node 节点的类型
function genNode (node, state) {
    if (node.type === 1) {  //节点
        return genElement(node, state)
    } else if (node.type === 3 && node.isComment) {
        // node
        // {
        //     end: 376,
        //     isComment: true,
        //     start: 361,
        //     static: true,
        //     text: " 这是一段注释 ",
        //     type: 3
        // }
        return genComment(node)
    } else {
        // 文本
        return genText(node)
    }
}

function genComment (comment) {
    return ("_e(" + (JSON.stringify(comment.text)) + ")")
}

function genText (text) {
    return (
        "_v(" +
            (
                text.type === 2
                    ? text.expression // no need for () because already wrapped in _s()
                    : transformSpecialNewlines(JSON.stringify(text.text))
            ) +
        ")"
    )
}




















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
function genElement( el,options ){
    //正常情况是没有的 如果有的话 就相当于是 v-pre 了
    //todo 哪种时候不知道
    if( el.parent ){
        console.log('hoho 有了 el.parent----->',el.parent)
        el.pre = el.pre || el.parent.pre
    }

    /**
        满足静态根节点的前提下
        只有包含 class 或者 style 或者 <div></div> 空标签就是 静态根节点,有id的时候 就不是静态根节点
        <div className="main" style="background: red;border: 1px solid red;">
            <p>
                <p>ddd</p>
            </p>
        </div>
     */
    if( el.staticRoot && !el.staticProcessed ){
        console.log(111)
    }
    console.log(el)
}
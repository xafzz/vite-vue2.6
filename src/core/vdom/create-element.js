
import config from "../config";
import {isDef, isPrimitive, isTrue, resolveAsset,isObject} from "../util";
import {createEmptyVNode, VNode} from "./vnode";
import {getTagNamespace, isReservedTag} from "../../web/util";
import {normalizeChildren} from "./helpers/normalize-children";

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
// 包装函数，用于提供更灵活的界面，而不会被流打扰

/*
    各个dom节点对应的生成的
    // function anonymous() {
    //     // with(this){
    //     return
    //         _c(
    //             'div',
    //             {staticClass:"main",attrs:{"id":"main","title":"1"}},
    //             [

                    // <div class="top">
                    //     这是一段正常的文字br
                    //     <div class="btn">
                    //         <input type="text" id="input" class="input" name="input" value="这是默认值" v-if="1" v-on:click="tag"  v-model="msg" />
                    //         <button  @click="tag" > 点击 </button>
                    // </div>
                    // </div>
    //                 _c(
    //                     'div',
    //                     {staticClass:"top"},
    //                     [
    //                         _v("\n        这是一段正常的文字br\n        "),
    //                         _c(
    //                             'div',
    //                             {staticClass:"btn"},
    //                             [(1)? _c('input',{staticClass:"input",attrs:{"type":"text","id":"input","name":"input","value":"这是默认值"},on:{"click":tag},model:{value:(msg),callback:function ($$v) {msg=$$v},expression:"msg"}}):_e(),_v(" "), _c('button',{on:{"click":tag}},[_v(" 点击 ")]),_v(" ")]),_v(" ")
    //                     ]
    //                 ),
    //                 _v(" "),

    //                 <!-- 这是一段注释 -->
    //                 _e(" 这是一段注释 "),


    //                 _v(" "),

                    // <div class="center" v-for="(item,key) in 10" :key="key">
                    //     <p>{{ msg }},{{ changeComputed }},{{computedParams(2)}},item:{{item}},key:{{key}}</p>
                    // </div>
    //                 _l(
    //                     (10),
    //                     function(item,key){
                                return _c(
                                            'div',
                                            {key:key,staticClass:"center"},
                                            [
                                                _c(
                                                    'p',
                                                    [
                                                        _v(_s(msg)+","+_s(changeComputed)+","+_s(computedParams(2))+",item:"+_s(item)+",key:"+_s(key))
                                                    ]
                                                ),
                                                _v(" ")
                                            ]
                                         )
                               }
    //                 ),

    //                 _v(" "),

                    // <div className="v-once" v-once>v-once</div>
    //                 _m(0),

    //                 _v(" "),

                    // <div>v-once</div>
    //                 _c(
    //                     'div',
    //                     [_v("\n        v-once\n    ")]
    //                 ),

    //                 _v(" "),

                    // <div class="bottom">
                    //     <a href="/" target="_blank" :title="msg" id="link" class="link" :class="cla" name="a">第三方的身份</a>
                    // </div>
    //                 _c(
    //                     'div',
    //                     {staticClass:"bottom"},
    //                     [
    //                         _c('a',{staticClass:"link",class:cla,attrs:{"href":"/","target":"_blank","id":"link","name":"a"}},[_v("第三方的身份")]),_v(" ")
    //                     ]
    //                 ),
    //------------------------------------------------------------
    //                 _v(" ")
    //             ],
    //             2
    //         )
    // // }
    // }
 */
/*
    _c 在 initRender 里面是这么定义的 vm._c = (a,b,c,d) => createElement(vm,a,b,c,d,false)
    context 就是 vm 也就是 vue 的this
    a, 是标签名称 div,p
    b, data ，标签上的属性 但是有些时候是没有的 就是一个空标签,可以没有 没有的话 就是
    c，children  他下面是否有子节点
    d, normalizationType 最外面有个 2 这个2是从哪来的呢？
        /src/compiler/codegen/generate.js  genNormalizationType
        //判断条件如下
        if( needsNormalization(el) || ( el.ifConditions && el.ifConditions.some(c=>{ needsNormalization(c.block) }) ) )
            needsNormalization 函数中 return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
        在 src/core/vdom/helpers/normalize-children.js 有一段很长的注释说明 解释了为什么要设置成2

    false alwaysNormalize
 */
/**
 * @description h函数仅是作为createElement函数之缩写，而render只是暴露给是开发者去使用createElement的钩子，因为本质上createElement是为了做渲染
 * @param context { Vue }
 * @param tag { 标签名称 }
 * @param data { ? 标签的属性,{} } 拿 a 来说 attrs:{href: "/",id: "link",name: "a",target: "_blank"},class: "class",staticClass: "link"
 * @param children { 是否有子节点,Array }
 * @param normalizationType
 * @param alwaysNormalize { boolean }
 */
export function createElement(
    context,
    tag,
    data,
    children,
    normalizationType,
    alwaysNormalize
){
    //isPrimitive string、number、symbol、boolean 返回 true
    // 文本节点 ？
    // 标签上没有任何 属性 就是一个单纯的标签 如 <div>xx</div>、<p>xx</p>
    // 如是 <div></div> 这样的标签 也不会走 if 因为他的if 是 undefined
    if( Array.isArray(data) || isPrimitive(data) ){
        //因为少了一个参数 所以在这重新把 参数 对齐下
        normalizationType = children
        children = data
        data = undefined
    }

    //这2种模式有什么不一样 alwaysNormalize
    if( isTrue(alwaysNormalize) ){
        normalizationType = ALWAYS_NORMALIZE
    }

    return _createElement(context, tag, data, children, normalizationType)
}

//这2个参数 可能会跟 编译的时候 options.whitespace = 'condense' 压缩一样
// todo 具体的跑着的时候 在看看
const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

/**
 * 这个才是 _c createElement 实际执行的函数
 * @param context { Vue }
 * @param tag { ?标签|string|class|function|object  } 这个也能为空什么情况下？
 * @param data { 标签属性|undefined }
 * @param children { 子节点｜undefined }
 * @param normalizationType { number|undefined }
 * @private
 */
export function _createElement(
    context,
    tag,
    data,
    children,
    normalizationType
){
    //判断数据是否是响应式数据
    // isDef  v !== undefined && v !== null
    // 在 observe 里面 响应式数据的依据是 __ob__
    if( isDef(data) && isDef(data.__ob__)){
        console.warn(`避免将观察到的数据对象用作vnode数据：${JSON.stringify(data)}，始终在每个渲染中创建新的vnode数据对象！`)
        //创建一个新的
        return createEmptyVNode()
    }

    //是否是 动态组件 用is判断
    if( isDef(data) && isDef(data.is) ){
        //什么意思呢
        // tag = data.is
        console.log('compile没有涉及到组件，暂时看不了is')
    }

    if( !tag ){
        // in case of component :is set to falsy value
        console.log('注释是:is 但是这块没用编译')
    }

    //isPrimitive 判断key的类型 不是 string number symbol boolean
    /*
        list:[{name:1,age:2}]
        <div class="center" v-for="(item,key) in list" :key="item">
     */
    if( isDef(data) && isDef(data.key) && !isPrimitive(data.key) ){
        // todo @binding ?
        if( !('@binding' in data.key) ){
            console.warn(`避免使用非原始值(${JSON.stringify(data.key)})作为键，而使用string/number类型`)
        }
    }

    // support single function children as default scoped slot
    if( Array.isArray(children) && typeof children[0] === 'function' ){
        //children 是是一个数组 或者 undefined
        console.log('没有碰到这种情况typeof children[0] 是 function')
    }

    //在目前这种情况下 最外层是 2  是因为 里面 有for的原因或者在上面可以找到
    if( normalizationType === ALWAYS_NORMALIZE ){ //标准模式
        //先放一下
        //进去全都是些undefined
        //return vnode 以后 这就可以来补上了
        //将 vnode 打平 并 检测 v-for 上是否有 key 没有key的话系统给他搞上一个
        children = normalizeChildren(children)
    }else if(normalizationType === SIMPLE_NORMALIZE ){ //简单模式
        console.log('简单模式 没有进来啊')
    }
    let vnode,ns
    //判断标签
    if( typeof tag === 'string' ){
        let Ctor
        //todo 不晓得为什么不行
        //config.getTagNamespace 现在应该是 /src/util/element.js 里面的 getTagNamespace ，但是我没有变过来
        //undefined
        ns = (context.$vnode && context.$vnode.ns) || getTagNamespace(tag)
        if( config.isReservedTag(tag) === isReservedTag(tag) ){
            console.warn(`isReservedTag跟config.isReservedTag相同了怎么做到的？`)
        }
        //检测是不是常用的html标签
        if( isReservedTag(tag) ){
            //平台内置元素
            if( isDef(data) && isDef(data.nativeOn) ){
                console.warn(`v-on的.native修饰符仅在组件上有效，但已在<${tag}>上使用`)
            }
            //为我们的html标签创建 vnode
            vnode = new VNode(
                //返回相同的标签
                config.parsePlatformTagName(tag),data,children,
                undefined,undefined,context
            )
        }else if((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options,'components',tag) )){
            console.log('没有写components')
        }else{
            // unknown or unlisted namespaced elements
            // check at runtime because it may get assigned a namespace when its
            // parent normalizes children
            console.log('生成vnode')
        }
    }else{
        console.log('tag类型不是string也挺好奇的,tag=',JSON.stringify(tag))
    }

    //结个尾 将 vnode 返回
    if( Array.isArray(vnode) ){
        console.log('vnode是一个数组,',vnode)
    }else if( isDef(vnode) ){

        if( isDef(ns) ){
            console.log('ns不为空了,',ns)
        }
        //data 有没有值 上面注释 也说明了
        if( isDef(data) ){
            //用到了 :class :style 需要深层渲染
            registerDeepBindings(data)
        }

        return vnode
    }else{
        console.log('vnode是空啊')
    }
}


// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings(data){
    if (isObject(data.style)) {
        console.log(':style用到了快来补上吧')
    }
    if (isObject(data.class)) {
        console.log(':class用到了快来补上吧')
    }
}

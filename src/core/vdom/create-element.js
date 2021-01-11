
import {isPrimitive, isTrue} from "../util";

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

    false alwaysNormalize
 */
/**
 * @description h函数仅是作为createElement函数之缩写，而render只是暴露给是开发者去使用createElement的钩子，因为本质上createElement是为了做渲染
 * @param context { Vue }
 * @param tag { 标签名称 }
 * @param data { ? 标签的属性,{} } 拿 a 来说 attrs:{href: "/",id: "link",name: "a",target: "_blank"},class: "class",staticClass: "link"
 * @param children { 是否有子节点,Array }
 * @param normalizationType
 * @param alwaysNormalize
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


export function _createElement(){
    // console.log(11)
}

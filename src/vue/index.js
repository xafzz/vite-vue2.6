

import Vue from '@/runtime/runtime'
import {compileToFunctions} from '@/compiler/compile'
import {query} from '@/util'
import config from '@/core/config'
//性能  怎么看 ？
//在浏览器控制台中 window.performance.getEntries() 参数详见 README.md
import {mark,measure} from '../core/util/perf'
import {shouldDecodeNewlines,shouldDecodeNewlinesForHref} from '../util/compat'

//指向 runtime/runtime.js 里面的 Vue.prototype.$mount
const mount = Vue.prototype.$mount
//编译时$mount
//将 template 转成 AST ，经过 optimize 优化打静态标记，
//generate 生成  render 函数
Vue.prototype.$mount = function (el,hydrating=false){

    el = el && query(el)

    //不能是 body 跟 html
    if( el === document.body || el === document.html ){
        console.warn('不能是<body>或者<html>标签')
        return this
    }

    //从哪儿来的呢？ 从 initMixin()->this._init()->mergeOptions()来的
    //$options 包含了当前组件中所有用到生命周期，data，watch，computed以及 过滤器 组件 自定义指令
    const options = this.$options
    //先写这儿 options 是 undefined options.render 还会报错,
    // 现在有了可以继续了
    //解析template/el并转换为render函数
    if( !options.render ){
        //历经千辛万苦将 options 实现了一部分，
        // template又是什么时候 跑到上面去的？  instance.js 直接在function vue里面挂上了
        // todo 这一块编译的过程不一样导致这儿不一样了
        let template = options.template
        if( template ){
            if( typeof template === 'string'){
                //charAt() 方法可返回指定位置的字符
                if( template.charAt(0) === '#' ){
                    console.log('什么情况模版的第一个字符串是#')
                }
            }
        }else{
            //没有template直接拿html里面的
            template = getOuterHTML( el )
        }


        //编译 性能 开始
        if ( config.performance && mark ){
            // 这是 开头 就跟标签一样 这是开始标签 参数 在 measure 第二个参数
            mark('compile start')
            // console.time('vue component name:' + (options.name) + ' compile')
        }
        // 生成 render 函数
        /**
         * 没有处理之前，返回的是
         *      render: 字符串
         *      staticRenderFns：[] 里面也是字符串 或者空
         * 处理以后，返回是 函数
         */
        const ref = compileToFunctions(template,{
            //输出源范围
            outputSourceRange: true,    //"development" !== 'production',
            //false 检查当前浏览器是否在属性值内编码字符
            shouldDecodeNewlines,
            shouldDecodeNewlinesForHref,

            //这个还挺关键的 也是在parse 里面用到了
            // undefined 可是在这之前没有地方处理他们的
            delimiters: options.delimiters,
            comments: options.comments
        })
        //生成render 函数 并将 render 函数 挂载到 options 上
        const render = ref.render
        const staticRenderFns = ref.staticRenderFns
        //主要是为了直接查看方便
        this.customRenderToString = ref.render.toString()
        options.render = render
        options.staticRenderFns = staticRenderFns

        if( config.performance && mark ){
            // 这是 结束 就跟标签一样 这是结束标签 参数 在 measure 第三个参数
            mark('compile end');
            //this._name 肯定是 options 的name 从哪来的呢 todo
            //对开始跟结尾进行 收集下，将第一个参数打印出来 startTime 单位是 毫秒数
            //window.performance.getEntries()
            //     name：资源名称，是资源的绝对路径或调用mark方法自定义的名称
            //     startTime:开始时间
            //     duration：加载时间
            //     entryType：资源类型，entryType类型不同数组中的对象结构也不同
            //     initiatorType：发起的请求者
            // console.timeEnd('vue component name:' + (options.name) + ' compile')
            measure(("vue component name:" + (options.name) + " compile"), 'compile start', 'compile end')
        }

    }

    console.log(this)
    /**
     *  call 、bind 、 apply 这三个函数的第一个参数都是 this 的指向对象
     *                  参数                      返回值
     *  call         多个参数用逗号分割             常规return
     *  apply           数组                      常规return
     *  bind         多个参数用逗号分割            新函数        必须要调用
     *
     *  三者的参数不限定是 string 类型，允许是各种类型，包括函数 、 object
     */
    //指向 runtime/runtime.js 里面的 Vue.prototype.$mount
    //调用runtime的mount
    //调用运行时的$mount
    return mount.call(this,el,hydrating)
    // return mount.apply(el,hydrating)
    // return mount.bind(this,el,hydrating)
}

//如果 template 为空 直接拿html #app 里面的内容
function getOuterHTML(el){
    if( el.outerHTML ){
        return el.outerHTML
    }else{
        console.log('没走到这儿')
    }
}

Vue.compile = compileToFunctions

export default Vue

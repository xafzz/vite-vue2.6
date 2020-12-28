

import Vue from '@/runtime/runtime'
import {compileToFunctions} from '@/compiler/compile'
import {query} from '@/util'
import config from '@/core/config'
//性能 todo 怎么看
import {mark,measure} from '@/core/util/perf'
import {shouldDecodeNewlines,shouldDecodeNewlinesForHref} from '@/util/compat'

//指向 runtime/runtime.js 里面的 Vue.prototype.$mount
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (el,hydrating){

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
            mark('compile')
        }

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

        if( config.performance && mark ){
            mark('compile end');
            //this._name 肯定是 options 的name 从哪来的呢 todo
            measure(("vue " + (options.name) + " compile"), 'compile', 'compile end');
        }

    }

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
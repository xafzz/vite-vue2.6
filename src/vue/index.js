

import Vue from '../runtime/runtime.js'
import {compileToFunctions} from "../compiler/compile.js";
import {query} from "../util/index.js";

//指向 runtime/runtime.js 里面的 Vue.prototype.$mount
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (el,hydrating){

    el = el && query(el)

    //不能是 body 跟 html
    if( el === document.body || el === document.html ){
        console.warn('不能是<body>或者<html>标签')
        return this
    }
    console.log(this)
    //从哪儿来的呢？
    const options = this.$options

    //先写这儿 options 是 undefined options.render 还会报错
    // if( !options.render ){
    //
    // }

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


Vue.compile = compileToFunctions

export default Vue
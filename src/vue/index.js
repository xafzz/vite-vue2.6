import Observer from "../observer/index.js";
import {compileToFunctions,compile} from "../compiler/index.js";

const Vue = function(options){

    // 里面包含了template 跟 script
    // this.obj = options
    this._template = options.App.template
    // this._script = options.App.script

    //将data里面的数据 转成 响应式数据
    // new Observer(obj.App.script.data())

    // this._compiler = new Compiler(obj.template)
    if( options.el ){
        this.$mount(options.el)
    }
}

Vue.prototype.$mount = function(el){

    el = el && query(el)

    //不能是 body 跟 html
    if( el === document.body || el === document.html ){
        console.warn('不能是<body>或者<html>标签')
        return this
    }
    //这2个都可以生成 好像没啥大的却别 后续 待考证
    // compile(this._template,{})
    compileToFunctions(this._template,{})
}

export default Vue

function query(el){
    //还有其他的
    if( typeof el === 'string' ){
        let selected = document.querySelector(el)
        if( !selected ){
            //warning 提示 同时创建 一个div
            console.warn('找不到节点：'+el)
            return document.createElement('div')
        }
        return selected
    }else{
        return el
    }
}
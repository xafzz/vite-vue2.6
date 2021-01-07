import { initMixin } from './init.js'
import Observer, {del, observe, set} from "../observer/observe";
import { stateMixin } from "./state";

function Vue(options){
    //编译的时候 将 template跟options放到文件里面
    let __template = options.App.template
    let __options = options.App.script
    //template 挂载到 options
    __options.template = __template
    //
    if( options.el ){
        __options.el = options.el
    }

    /*
        通过 this instanceof Vue 来判断有没有用new关键词调用
        instanceof 判断是否实例是否属于某种类型，也可以在继承关系中判断一个实例是否属于他的父类型
        可以分解为  this.__proto__ 和 Vue.prototype
        没有this指向window，结果为false
        使用了new
            第一步: 创建一个空的对象，vat o = {}。
            第二步: 链接该对象（即设置该对象的构造函数）到另一个对象，即o.__proto__ == Vue.prototype。
            第三步: 将步骤 1 新创建的对象作为 this 的上下文
            第四步: 如果该函数没有返回对象，则返回 this
         结果：
            o.__proto == this.__proto__ == Vue.prototype
         所以如果用了 new 操作符 结果为 ture
     */

    if( !(this instanceof Vue) ){
        console.warn('Vue is a constructor and should be called with the `new` keyword')
    }

    //你又在哪？
    //在 initMixin 里面 第一行就是 Vue.prototype._init=function()
    //挂载到原型上了
    this._init(__options)
}

//字面意思就是 init 呗
initMixin(Vue)
stateMixin(Vue)

export default Vue

/**
 * Observer类会通过递归的方式把一个对象的所有属性都转化成可观测对象
 */
import dom from './dom.js'
// 源码：src/core/observer/index.js
export default class Observer
{
    constructor(obj) {
        this.obj = obj

        // 给value新增一个__ob__属性，值为该value的Observer实例
        // 相当于为value打上标记，表示它已经被转化成响应式了，避免重复操作
        this.def(obj,'__ob__',this)
        //判断是 Array or Object
        //todo 数组的回头在看
        if( Array.isArray(obj) ){
            //源码位置 src/core/util/env.js
            // can we use __proto__?
            let hasProto = '__proto__' in {}
            //arr
            //todo 测试 都是true 不为true 是什么时候
            if(hasProto){
                //源码位置 src/core/observer/array.js
                //从原型上创建个空数组  跟直接用 [] 有什么区别
                let arrayProto = Array.prototype
                let arrayMethods = Object.create(arrayProto)

                this.protoAugment(obj, arrayMethods)
            }
            this.observeArray(obj)

        }else{
            //obj
            this.walk()
        }
    }
    //object 处理方法
    walk(){
        let keys = Object.keys(this.obj)
        // console.time()
        // keys.forEach(val=>{
        //     console.log('forEach->',val)
        // })
        // console.timeEnd() //default:0.244873046875 ms
        // 虽然每次时间 都不一样 但是 for要快一点
        // 但是下面这种情况 forEach要明显快很多
        // keys = new Array(3)
        // keys[0] =1
        // keys[999] =2
        // console.time()
        for(let i=0;i<keys.length;i++){
            // console.log('for->',keys[i])
            this.defineReactive(this.obj,keys[i])
        }
        // console.timeEnd() // default: 0.18115234375 ms
        // console.log(keys)
    }

    //
    observeArray(val){
        for(let i=0;i<val.length;i++){
            // console.log('for->',val[i])

            // this.observe(this.obj[i])
            this.observe(val[i])

            // this.defineReactive(this.obj,keys[i])
        }
    }


    /**
     * Augment a target Object or Array by intercepting
     * the prototype chain using __proto__
     */
    //数组 为啥要在包一层
    protoAugment(target,src){
        target.__proto__ = src
    }
    // 使 一个数组可以变成 可监控
    /**
     * Attempt to create an observer instance for a value,
     * returns the new observer if successfully observed,
     * or the existing observer if the value already has one.
     */
    observe(val){
        //不能胃object？
        if( !this.isObject(val) ){
            return
        }
        let ob
        if(this.hasOwn(val,'__ob__') && val.__ob__ instanceof Observer){
            ob = val.__ob__
        }else{
            ob = new Observer(val)
        }

        return ob
    }
    //源码
    isObject(arg) {
        return arg !== null && typeof arg === 'object';
    }

    //源码 src/shared/util.js
    hasOwn (obj, key) {
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
        //)方法返回一个布尔值，该布尔值指示对象是否具有指定的属性作为其自身的属性（而不是继承它）
        let hasOwnProperty = Object.prototype.hasOwnProperty
        return hasOwnProperty.call(obj, key)
    }
    /**
     * 使一个对象转化成可观测对象
     * @param { Object } obj 对象
     * @param { String } key 对象的key
     * @param { Any } val 对象的某个key的值
     */
    defineReactive(obj,key,val){
        //arguments 是一个对应于传递给函数的参数的类数组对象。
        //文档地址：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/arguments
        // console.log(arguments)
        // 如果只传了obj和key，那么val = obj[key]
        if( arguments.length === 2 ){
            val = obj[key]
        }
        //如果是多层嵌套
        if( typeof val === 'object' ){
            new Observer(val)
        }
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:true,
            get(){
                console.log(`get：${key}属性被读取了`);
                return val
            },
            set(newVal){
                if( val === newVal ){
                    return
                }
                console.log(`set：${key}属性被修改了，newVal：${newVal}`);
                //将操作html放到这儿 虽然耗性能了点 但是实现了 视图更新
                //如果同时更改多个字段值 更改一次 渲染一次
                //都处理以后 集中更新一次就好了
                dom(key,newVal)
                val = newVal
            }
        })
    }

    //源码 /src/core/util/lang.js
    def(obj,key,val ,enumerable ){
        Object.defineProperty(obj,key,{
            //该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。
            // 默认为 undefined。
            value:val,
            //当且仅当该属性的 enumerable 键值为 true 时，该属性才会出现在对象的枚举属性中。
            // 默认为 false。
            enumerable:!!enumerable,
            //当且仅当该属性的 writable 键值为 true 时，属性的值，也就是上面的 value，才能被赋值运算符改变。
            // 默认为 false。
            writable:true,
            //当且仅当该属性的 configurable 键值为 true 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除。
            // 默认为 false
            configurable:true
        })
    }
}
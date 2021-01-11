/**
 * VNode 用 javascript 对象来描述真实 DOM，这么描述，把DOM标签，属性，内容都变成 对象的属性
 * @param tag { ?string }
 * @param data { ?VNodeData }
 * @param children { ?Array }
 * @param text { ?string }
 * @param elm { ?Node }
 * @param context { ?Component } 再次组件范围内渲染
 * @param componentOptions { ?VNodeComponentOptions }
 * @param asyncFactory { ?Function }
 * @constructor
 */
const VNode = function VNode(
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
){
    // 当前节点标签名
    this.tag = tag
    // 当前节点数据（VNodeData类型），像 class、id 等HTML属性都放在了 data 中
    this.data = data
    // 当前节点子节点
    this.children = children
    // 当前节点文本
    this.text = text
    // 当前节点对应的真实DOM节点，elm 属性则指向了其相对应的真实 DOM 节点
    this.elm = elm
    // 当前节点命名空间
    this.ns = undefined
    // 当前节点上下文，所有对象的 context 选项都指向了 Vue 实例
    this.context = context
    // 子节点key属性
    this.key = data && data.key
    // 组件配置项
    this.componentOptions = componentOptions
    // 组件实例
    this.componentInstance = undefined
    // 当前节点父节点
    this.parent = undefined

    // strictly internal

    // contains raw HTML? (server only)
    // 是否为原生HTML或只是普通文本
    this.raw = false
    // 静态节点标志 keep-alive
    this.isStatic = false
    // 是否作为根节点插入
    this.isRootInsert = true
    // empty comment placeholder?
    // 是否为注释节点
    this.isComment = false
    // 是否为克隆节点
    this.isCloned = false
    // 是否为v-once节点
    this.isOnce = false
    // async component factory function
    //异步工厂方法
    this.asyncFactory = asyncFactory
    // 异步Meta
    this.asyncMeta = undefined
    // 是否为异步占位
    this.isAsyncPlaceholder = false
    // 函数化组件上下文
    this.fnContext = undefined
    // 函数化组件配置项，用于 ssr 缓存
    this.fnOptions = undefined
    // 函数化组件ScopeId
    this.fnScopeId = undefined

}

//todo 不知道为什么要这么做
let prototypeAccessors = {
    child : {
        configurable:true
    }
}

//不推荐使用：向后兼容的componentInstance的别名
prototypeAccessors.child.get = function (){
    return this.componentInstance
}

//defineProperties 方法直接在一个对象上定义新的属性或修改现有属性，并返回该对象。
Object.defineProperties(VNode.prototype,prototypeAccessors)

export { VNode }

//创建文本节点
export function createTextVNode( val ){
    //vnode:97 VNode {tag: undefined, data: undefined, children: undefined, text: " 点击 ", elm: undefined, …}
    //console.log(new VNode(undefined,undefined,undefined,String(val)))
    return new VNode(undefined,undefined,undefined,String(val))
}
export function createEmptyVNode(text=''){
    let node = new VNode()
    node.text = text
    node.isComment = true
    // VNode {tag: undefined, data: undefined, children: undefined, text: " 这是一段注释 ", elm: undefined, …}
    // console.log(node)
    return node
}

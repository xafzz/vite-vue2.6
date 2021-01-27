import {isDef, isPrimitive, isRegExp, isTrue, isUndef} from "../../shared/util";
import {SSR_ATTR} from "../../shared/constants";
import {VNode} from "./vnode";
import config from "../config";
import {activeInstance} from "../instance/lifecycle";


export const emptyNode = new VNode('', {}, [])

const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

/**
 *
 * @param backend
 * @returns {function(*=, *=, *=, *): undefined}
 */
export function createPatchFunction(backend){

    let i,j
    const cbs = {}

    const {modules,nodeOps} = backend

    //
    for (let k = 0; k < hooks.length ; ++k) {
        cbs[hooks[k]]=[]
        for (let l = 0; l < modules.length ; ++l) {
            if( isDef( modules[l][hooks[k]] ) ){
                cbs[hooks[k]].push(modules[l][hooks[k]])
            }
        }
    }


    //创建空的节点
    function emptyNodeAt(elm){
        //tagName 获取的元素名称是一个大写的所以要用toLowerCase
        return new VNode(nodeOps.tagName(elm).toLowerCase(),{},[],undefined,elm)
    }

    //暂时没有用这个函数
    function isUnknownElement (vnode, inVPre) {
        return (
            !inVPre &&
            !vnode.ns &&
            !(
                config.ignoredElements.length &&
                config.ignoredElements.some(ignore => {
                    return isRegExp(ignore)
                        ? ignore.test(vnode.tag)
                        : ignore === vnode.tag
                })
            ) &&
            config.isUnknownElement(vnode.tag)
        )
    }

    /**
     * 检查 key 是否重复，递归出所有子vnode 也很重要
     * @param vnode 当前vnode
     * @param children  children 子vnode
     * @param insertedVnodeQueue []
     */
    function createChildren(vnode,children,insertedVnodeQueue){
        if( Array.isArray(children) ){
            {
                //检查重复key 主要针对 v-for 跟 静态组件
                // 其他的情况基本不设置key
                checkDuplicateKeys(children)
            }

            for (let i = 0; i < children.length ; ++i) {
                createElm(
                    children[i],
                    insertedVnodeQueue,
                    vnode.elm,
                    null,
                    true,
                    children,
                    i
                )
            }
        }else if(isPrimitive(vnode.text)){
            console.log('children不是一个数组')
        }
    }

    /**
     * 检查重复key,主要针对 v-for 跟 静态组件
     * @param children { array }
     */
    function checkDuplicateKeys(children){
        const seenKeys = {}
        for (let i = 0; i < children.length ; i++) {
            //子vnode
            const vnode = children[i]
            const key = vnode.key

            if( isDef(key) ){
                if( seenKeys[key] ){
                    console.warn(`Duplicate keys detected: '${key}'. This may cause an update error.`,)
                }else{
                    seenKeys[key]=true
                }
            }
        }
    }

    let creatingElmInVPre = 0
    //核心函数
    /**
     *
     * @param vnode { any } 新生成的 vnode
     * @param insertedVnodeQueue {array} []
     * @param parentElm {any} 为什么是 body 而不是指定的 #app 呢
     * @param refElm {any} 跟 #app 相邻的 元素
     * @param nested
     * @param ownerArray
     * @param index
     */
    function createElm(
        vnode,
        insertedVnodeQueue,
        parentElm,
        refElm,
        nested,
        ownerArray,
        index
    ){
        /*
            v !== undefined && v !== null 不为空
            初次渲染
                vnode.elm、ownerArray undefined
                ownerArray 我根本就没有传值
         */
        if( isDef(vnode.elm) && isDef(ownerArray) ){
            // This vnode was used in a previous render!
            // now it's used as a new node, overwriting its elm would cause
            // potential patch errors down the road when it's used as an insertion
            // reference node. Instead, we clone the node on-demand before creating
            // associated DOM element for it.
            // 此vnode用于先前的渲染中！
            // 现在它被用作新节点，覆盖它的elm用作插入参考节点时可能会导致潜在的补丁错误。
            // 相反，我们先按需克隆节点，然后为其创建关联的DOM元素。
            console.log('有的时候看下')
        }

        // for transition enter check
        // 初次渲染 没有 nested so vnode.isRootInsert 为 true
        // 是跟节点插入的
        vnode.isRootInsert = !nested
        if( createComponent(vnode,insertedVnodeQueue,parentElm,refElm) ){
            console.log('不知道干什么的')
        }

        //元素的 属性
        const data = vnode.data
        //子节点
        const children = vnode.children
        //当前元素的标签名称
        const tag = vnode.tag
        /*
            对 vnode 分为三类
            标签 可能是自定义标签/html标签
            注释
            文本
         */
        if( isDef(tag) ){ //自定义标签跟html标签

            //检测标签是否正确
            {
                //v-pre
                if( data && data.pre ){
                    creatingElmInVPre++
                }
                // if( isUnknownElement(vnode,creatingElmInVPre) ){
                //
                // }
                //不检测标签是否正确
            }

            // vnode.elm 有值了 就是创建的 空标签
            vnode.elm = vnode.ns
                ? console.log('vnode.ns不是undefined了')
                : nodeOps.createElement(tag, vnode)
            //没有写完也不知道干什么啊 设置什么范围？
            setScope(vnode)

            //__WEEX__ 省略
            //递归 createElm 将所有的子vnode
            createChildren(vnode,children,insertedVnodeQueue)

            //元素上是否有属性
            if( isDef(data) ){
                invokeCreateHooks(vnode,insertedVnodeQueue)
            }

        }else if( isTrue(vnode.isComment) ){ //注释

        }else{  //文本

        }
    }

    /**
     * @description 不知道干什么的
     * @param vnode 新node
     * @param insertedVnodeQueue 到这 还是 []
     * @param parentElm 父节点
     * @param refElm
     */
    function createComponent(vnode,insertedVnodeQueue,parentElm,refElm){
        let i = vnode.data

        if( isDef(i) ){
            const isReactivated =isDef( vnode.componentInstance ) && i.keepAlive
            if( isDef(i=i.hook) && isDef(i = i.init) ){
                console.log('属性上有hook，init')
            }

            if( isDef(vnode.componentInstance) ){
                console.log('vnode.componentInstance：',vnode.componentInstance)
            }
        }
    }

    /**
     * @description 设置作用域CSS的作用域ID属性。这是作为一种特殊情况实现的，以避免进行常规属性修补过程的开销。
     * @param vnode 新的 vnode 并且有了 elm
     */
    function setScope(vnode){
        let i
        //没有应用组件
        if( isDef( i = vnode.fnScopeId ) ){
            console.log('vnode.fnScopeId',vnode.fnScopeId)
        }else{
            let ancestor = vnode
            while (ancestor){

                if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
                    console.log(222)
                }
                // undefined
                ancestor = ancestor.parent
            }
        }

        //for slot content they should also get the scopeId from the host instance.
        if(
            isDef(i=activeInstance) &&
            i !== vnode.context &&
            i !== vnode.fnContext &&
            isDef(i = i.$options._scopeId)
        ){
            console.log('没有进来')
        }
    }

    /**
     * 将各个vnode上面的 data属性 放上 解析出来
     * @param vnode
     * @param insertedVnodeQueue []
     */
    function invokeCreateHooks(vnode,insertedVnodeQueue){

        console.error('-------->处理前的vnode:',vnode)
        for (let i = 0; i < cbs.create.length ; ++i) {
            cbs.create[i](emptyNode,vnode)
        }
        console.error('处理后的vnode:',vnode)
    }

    /**
     * @param oldVnode 如果是初次渲染 <div id="app">xx</div>
     * @param vnode 通过 _render 生成的 vnode
     * @param hydrating false 可能跟服务器渲染有关
     * @param removeOnly false
     */
    return function patch(oldVnode, vnode, hydrating, removeOnly){

        //v === undefined || v === null
        if( isUndef(vnode) ){
            console.log('vnode为空,',vnode)
            return
        }

        let isInitialPatch = false
        //vnode 队列
        const insertedVnodeQueue = []

        //v === undefined || v === null
        //没有挂载的吗？ 是的
        // $mount("") 为空的时候
        // 先不考虑这种情况
        if( isUndef(oldVnode) ){
            // empty mount (likely as component), create new root element
            // isInitialPatch = true
            // createElm(vnode,insertedVnodeQueue)
            console.log('没有找到老的节点')
        }else{
            //如果第一次渲染的时候 true 因为直接获取的 div dom节点
            //如果是vnode 是没有 nodeType
            /*
                常用的 nodeType
                1 元素节点
                2 属性
                3 文本节点
                8 注释节点
                9 整个文档
             */
            const isRealElement = isDef(oldVnode.nodeType)
            if( !isRealElement ){
                console.log('当不是初次渲染的时候，还有判断条件')
            }else{
                //初次渲染
                if( isRealElement ){
                    // mounting to a real element
                    // 挂载到真是的节点
                    // check if this is server-rendered content and if we can perform
                    // 检查这是否是服务器渲染的内容以及我们是否可以执行
                    // a successful hydration.
                    /*
                        第一次写的时候 将 hasAttribute 写成了 hasAttributes 走了不少弯路
                        hasAttribute： 判断元素上是有指定的属性
                        hasAttributes：判断元素上面是否有属性
                     */
                    if( oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR) ){
                        //虽然是元素节点但不是服务器渲染的
                        console.log('SSR了')
                        //
                        hydrating = true
                    }
                    // 当时 ssr 的时候 设置 hydrating = true
                    // todo 不是 ssr 的也有可能是 true吗
                    if( isTrue(hydrating) ){
                        console.log('不是ssr的时候hydrating也是true?',hydrating)
                    }

                    // either not server-rendered, or hydration failed.
                    // create an empty node and replace it
                    // 用当前元素的节点 创建一个空节点替换他
                    oldVnode = emptyNodeAt(oldVnode)
                }else{
                    //打印下 oldVnode 是一个vnode的时候 看看是什么
                    console.log('oldVnode是一个vnode,',oldVnode.elm)
                }

                //替换现有的元素
                //还是拿到老的但是不知道 oldVnode 是一个vnode 的时候是什么
                // <div id="app">xxx</div>
                const oldElm = oldVnode.elm
                //todo 这个地方拿到父节点以后 是 body，我在放的时候 没有放到或者替换 #app 里面的内容
                const parseElm = nodeOps.parentNode(oldElm)

                //todo 不知道是什么 什么情况下 会有
                if( oldElm._leaveCb ){
                    console.log(oldElm._leaveCb)
                }

                //创建一个新的node
                createElm(
                    vnode, //新的vnode
                    insertedVnodeQueue, //队列为空
                    // extremely rare edge case: do not insert if old element is in a
                    // leaving transition. Only happens when combining transition +
                    // keep-alive + HOCs. (#4590)
                    // HOC 高阶组件
                    //todo 为什么是父级而不是 当前元素
                    // 这样不是放到了 body 下面嘛
                    oldElm._leaveCb ? null : parseElm,
                    nodeOps.nextSibling(oldElm) //可能没有 没有的话 就是 body 了，
                )
                console.log(111,nodeOps.nextSibling(oldElm))

            }
        }

    }
}

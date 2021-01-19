
import {isDef, isPrimitive, isRegExp, isTrue, isUndef} from "../../shared/util";
import {isTextInputType ,isUnknownElement as isUnknownElements} from "../../web/util";
import {SSR_ATTR} from "../../shared/constants";
import {VNode} from "./vnode";
import config from "../config";
import {activeInstance} from "../instance/lifecycle";

/**
 * todo
 * 比对的是2个 vnode ，我怎么感觉这就是vnode的比对过程呢
 * @param oVal 老vnode或者dom
 * @param nVal 新vnode
 * @returns {boolean}
 */
function sameVnode( oVal,nVal ){
    return (
        oVal.key === nVal.key && (  //vnode 的 key 就是标签上的 key
            (
                oVal.tag === nVal.tag &&  //标签名字
                oVal.isComment === nVal.isComment && //注释内容
                isDef(oVal.data) === isDef(nVal.data) && //各个属性
                sameInputType(oVal,nVal) //是否是 input input 有单独验证方式
            ) || (
                /*
                    这块都在 VNode 类中
                    // async component factory function
                    //异步工厂方法
                    this.asyncFactory = asyncFactory
                    // 是否为异步占位
                    this.isAsyncPlaceholder = false
                 */
                isTrue(oVal.isAsyncPlaceholder) &&
                oVal.asyncFactory === nVal.asyncFactory &&
                isUndef(nVal.asyncFactory.error)
            )
        )
    )
}

/**
 * input 相关的
 * @param oVal 老vnode或者dom
 * @param nVal 新vnode
 * @returns {boolean}
 */
function sameInputType(oVal,nVal){
    // 如果不是 input 返回 true
    if( oVal.tag !== 'input' ){
        return true
    }
    let i
    // input attrs 各个属性
    // type 类型
    const typeA = isDef(i = oVal.data) && isDef(i=i.attrs) && i.type
    const typeB = isDef(i = nVal.data) && isDef(i = i.attrs) && i.type
    // isTextInputType input 的type 类型
    console.log('到了input在打印下看看')
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}


const hooks = ['create', 'activate', 'update', 'remove', 'destroy']
/**
 *
 * @param backend
 * @returns { function(any, any, boolean, boolean): Object }
 */
export function createPatchFunction(backend){
    //看执行的顺序 应该先写这块
    //还是用到在写吧 印象深
    let i,j
    const cbs = {}

    const { nodeOps } = backend

    for (let k = 0; k < hooks.length ; k++) {

    }

    /**
     * 用当前元素的 创建一个空的vnode，
     * @param elm
     * @returns {VNode}
     */
    function emptyNodeAt(elm){

        return new VNode(
            nodeOps.tagName(elm).toLowerCase(), //所以要小写下
            {},
            [],
            undefined,
            elm //存放的是当前的元素
        )
    }

    /**
     * @description 没有生成新vnode,只能用老的顶顶了 <br/>
     *              没有生成新的,是不是在更新的时候也可能这样？
     * @param vnode { any|oldVnode }
     */
    function invokeDestroyHook(vnode){
        let i,j
        //
        let data = vnode.data
        if( isDef(data) ){
            console.log('data有值，',data)
        }
        //都是undefined 也是相等呗
        if( isDef(i=vnode.children) ){
            if (vnode.children.length){
                console.log('vnode.children.length有长度的再来找你,',vnode.children)
            }
        }
    }

    function isUnknownElement(vnode,inVPre){
        return (
            !inVPre && //0
            !vnode.ns &&
            !(
                config.ignoredElements.length &&
                config.ignoredElements.some(ignore => {
                    return isRegExp(ignore)
                        ? ignore.test(vnode.tag)
                        : ignore === vnode.tag
                })
            ) &&
            // 没有安装成功
            // 这个函数不奏效 其实是走的 /src/web/util/element.js isUnknownElement
            isUnknownElements(vnode.tag)
        )
    }

    // v-pre
    let creatingElmInVPre = 0
    /**
     *
     * @param vnode 新生成的 vnode
     * @param insertedVnodeQueue   插入 vnode 队列 []
     * @param parentElm 父级元素
     * @param refElm  同级的下个元素
     * @param nested  是否作为根节点插入
     * @param ownerArray { undefined }
     * @param index { undefined }
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
        if (isDef(vnode.elm) && isDef(ownerArray)) {
            // This vnode was used in a previous render!
            // now it's used as a new node, overwriting its elm would cause
            // potential patch errors down the road when it's used as an insertion
            // reference node. Instead, we clone the node on-demand before creating
            // associated DOM element for it.
            // 此vnode用于先前的渲染中！现在它被用作新节点，
            // 覆盖它的elm用作插入参考节点时可能会导致潜在的补丁错误。
            // 相反，我们先按需克隆节点，然后为其创建关联的DOM元素。

            console.log('elm:',vnode.elm,'ownerArray:',ownerArray)
        }

        // for transition enter check
        // 是否作为根节点插入 vnode 为 false
        vnode.isRootInsert = !nested

        if( createComponent(vnode,insertedVnodeQueue,parentElm,refElm) ){
            console.log('这应该是组件相关的内容')
        }

        // <div></div>
        // 元素上的属性 没有属性为 undefined
        const data = vnode.data
        // 空标签 是 undefined
        const children = vnode.children
        //
        const tag = vnode.tag
        if( isDef(tag) ){
            {
                // <div v-pre></div>
                if( data && data.pre ){
                    creatingElmInVPre ++
                }
                if( isUnknownElement(vnode,creatingElmInVPre) ){
                    console.warn(`Unknown custom element: < ${tag}> - did you register the component correctly? For recursive components, make sure to provide the "name" option.`)
                }
            }

            // vnode.ns undefined
            // 当不是select 时 创建一个空的 html 标签 没有任何属性跟内容
            vnode.elm = vnode.ns
                ? console.log('vnode.ns 有值了',vnode.ns)
                : nodeOps.createElement(tag,vnode)

            setScope(vnode)

            // 不是 weex
            {
                //递归所有子节点
                createChildren(vnode,children,insertedVnodeQueue)
                //当有属性的时候
                if( isDef(data) ){
                    //data属性的先放放
                    invokeCreateHooks(vnode, insertedVnodeQueue)
                }
                insert(parentElm,vnode.elm,refElm)
            }
        }else if( isTrue(vnode.isComment) ){  //注释
            // console.log(22222,vnode)
            vnode.elm = nodeOps.createComment(vnode.text)
            insert(parentElm, vnode.elm, refElm)

        }else{  //文本
            // 就是文本内容
            vnode.elm = nodeOps.createTextNode(vnode.text)
            insert(parentElm, vnode.elm, refElm)
        }

    }

    /**
     *
     * @param parent 父级元素
     * @param elm  当不是select 时 创建一个空的 html 标签 没有任何属性跟内容
     * @param ref 同级的下个元素
     */
    function insert(parent, elm, ref){
        if( isDef(parent) ){
            //有同级元素
            if( isDef(ref) ){
                //判断是否是同一个父级下面的
                if( nodeOps.parentNode(ref) === parent ){
                    nodeOps.insertBefore(parent, elm, ref)
                }

            }else{  //没有同级
                nodeOps.appendChild(parent,elm)
            }
        }else{
            console.log('parent还有没有的时候？哪一个没有父级？',parent)
        }
    }

    /**
     * 递归出所有子节点 vnode
     * @param vnode 创建生成的 vnode
     * @param children  子节点 vnode
     * @param insertedVnodeQueue []
     */
    function createChildren(vnode, children, insertedVnodeQueue){
        if( Array.isArray(children) ){
            {
                //检查key 是否有重复
                checkDuplicateKeys(children)
            }
            for (let k = 0; k < children.length; k++) {
                //递归
                createElm(children[k], insertedVnodeQueue, vnode.elm, null, true, children, k)
            }
        }else if(isPrimitive(vnode.text)){
            console.log('应该有vnode.text啊',vnode.text)
        }
    }

    function invokeCreateHooks(vnode, insertedVnodeQueue){
        // for (let k = 0; k < cbs.create.length ; ++k) {
        //
        // }
        console.info(`<${vnode.tag} ${JSON.stringify(vnode.data)}>没有写`)
    }

    //检查重复 key
    function checkDuplicateKeys(children){
        const seenKeys = {}
        for (let i = 0; i < children.length; i++) {
            //每个 vnode
            const vnode = children[i]
            const key = vnode.key
            // 除了 for 以外 其他的基本不写 key
            if( isDef(key) ){
                if( seenKeys[key] ){
                    console.warn(`Duplicate keys detected: '${key}'. This may cause an update error.`)
                }else{
                    seenKeys[key] = key
                }
            }
        }
    }

    // set scope id attribute for scoped CSS.
    // this is implemented as a special case to avoid the overhead
    // of going through the normal attribute patching process.
    function setScope(vnode){
        let i
        if( isDef(i = vnode.fnScopeId) ){
            console.log('vnode.fnScopeId在哪实现的',vnode.fnScopeId)
        }else{
            let ancestor = vnode
            while (ancestor) {
                // i 其实就是 vue
                if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
                    console.log('i.$options._scopeId',i.$options._scopeId)
                }
                // undefined
                ancestor = ancestor.parent
            }
        }
        // for slot content they should also get the scopeId from the host instance.
        // activeInstance vm
        if(
            isDef(i=activeInstance) &&
            i !== vnode.context &&
            i !== vnode.fnContext &&
            isDef(i = i.$options._scopeId)
        ){
            console.log('i.$options._scopeId',i.$options._scopeId)
        }
    }

    // component 组件
    function createComponent(vnode, insertedVnodeQueue, parentElm, refElm){
        /*
        data:
            attrs: {id: "main", title: "1"}
            staticClass: "main"
         */
        let i = vnode.data
        // 元素上 存在 属性的时候
        if( isDef(i) ){
            // componentInstance vnode 组件实例 undefined
            // keepAlive
            // false
            const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
            if( isDef(i= i.hook) && isDef(i= i.init) ){
                console.log('hook,init')
            }

            // after calling the init hook, if the vnode is a child component
            // it should've created a child instance and mounted it. the child
            // component also has set the placeholder vnode's elm.
            // in that case we can just return the element and be done.
            // 调用init钩子后，如果vnode是子组件，
            // 则应创建一个子实例并将其挂载。
            // 子组件还设置了占位符vnode的elm。
            // 在这种情况下，我们只需返回元素并完成
            if( isDef(vnode.componentInstance) ){
                console.log('componentInstance')
            }
        }
    }

    /**
     * @description <br/>
     *     1、src/core/instance/lifecycle.js，初次渲染的时候 Vue.prototype._update <br/>
     * @param oldVnode { any } 这是旧的dom，第一次渲染的时候就是 <div id=app></div> 是object
     * @param vnode { any } 这是新生成的vnode 是一个 object
     * @param hydrating { boolean } false
     * @param removeOnly { boolean } false
     * @returns {{}}
     */
    return function patch(oldVnode, vnode, hydrating, removeOnly){
        //vnode 为空
        if( isUndef(vnode) ){
            if( isDef(oldVnode) ){
                // 手动设置
                // vnode=null
                // 先进来看看是干什么的
                // 还是不行 不知道干什么的 以后在写吧
                invokeDestroyHook(oldVnode)
            }
            console.log('没有vnode，什么时候？')
            return
        }

        //初始 path
        let isInitialPatch = false
        // 插入 vnode 队列
        const insertedVnodeQueue = []

        if( isUndef(oldVnode) ){
            // empty mount (likely as component), create new root element
            console.log('oldVnode是空的')
        }else{
            //到这儿为止 oldVnode、vnode 都是存在的
            //是真实的元素 第一次渲染的时候 以后肯定不是 真实元素
            /**
             * nodeType 节点类型 共有 12个 常见的
             * https://www.runoob.com/jsref/prop-node-nodetype.html
             * 常见有
             *      元素节点 1
             *      属性节点 2
             *      文本节点 3
             *      注释节点 4
             */
            //
            let isRealElement = isDef(oldVnode.nodeType)
            // !isRealElement 如果是 vnode undefined
            // sameVnode(oldVnode,vnode) 比对两个节点是否是一样的
            //  或者后面的 暂时没有设置true的地方
            if(  !isRealElement && sameVnode(oldVnode,vnode) ){
                // patch existing root node
                //是同一个节点的时候直接修改现有的节点
                console.log('什么时候会走到这呢')
            }else{

                // 如果 不是 vnode 的时候
                if( isRealElement ){
                    // mounting to a real element
                    // check if this is server-rendered content and if we can perform
                    // a successful hydration.
                    // hasAttributes 如果某节点有任何属性时返回true，否则返回false
                    // hasAttribute 差一个s 结果天差地别 按编辑器的提示来 多打了个 s
                    // 是元素节点 并且 还是 SSR相关的
                    if( oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR) ){
                        console.log('gaga短期我是打印不到你了')
                        //
                        //当旧的VNode是服务端渲染的元素，hydrating记为true
                        oldVnode.removeAttribute(SSR_ATTR)
                        // 哼哼 你也会true了
                        hydrating = true
                    }

                    if( isTrue(hydrating) ){
                        console.log('hydrating怎么可能是true',hydrating)
                    }

                    // either not server-rendered, or hydration failed.
                    // create an empty node and replace it
                    // oldVnode #app
                    // 用当前元素创建一个空的vnode
                    oldVnode = emptyNodeAt(oldVnode)
                }

                // replacing existing element
                // 不知道要干什么用
                // 这是之前 html 里面的 元素
                const oldElm = oldVnode.elm
                // 获取父级
                const parentElm = nodeOps.parentNode(oldElm)
                // const parentElm = oldElm

                // oldElm._leaveCb 干什么用的
                if( oldElm._leaveCb ){
                    console.log('oldElm._leaveCb 是什么？',oldElm._leaveCb )
                }

                //创建新的node
                createElm(
                    vnode,  //生成的vnode
                    insertedVnodeQueue, //[]
                    // extremely rare edge case: do not insert if old element is in a
                    // leaving transition. Only happens when combining transition +
                    // keep-alive + HOCs. (#4590)
                    // todo _leaveCb 没有设置过
                    oldElm._leaveCb ? null : parentElm, //这就是#app的父级
                    //nextSibling 同级的下个元素
                    nodeOps.nextSibling(oldElm)
                )
            }

        }

        return vnode.elm
    }
}

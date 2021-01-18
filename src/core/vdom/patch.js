
import { isDef, isTrue, isUndef} from "../../shared/util";
import {isTextInputType} from "../../web/util";
import {SSR_ATTR} from "../../shared/constants";
import {VNode} from "./vnode";


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


    function createElm(){
        console.log(11)
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

                createElm()
            }

        }


        return {}
    }
}

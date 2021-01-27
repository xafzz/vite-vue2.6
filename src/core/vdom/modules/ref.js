



export default {
    create(_,vnode){
        registerRef(vnode)
    },
    update(){
        console.log('update')
    },
    destroy(){
        console.log('destroy')
    }
}

/**
 *
 * @param vnode
 * @param isRemoval { ?boolean }
 */
export function registerRef(vnode,isRemoval){
    console.log('register')
}

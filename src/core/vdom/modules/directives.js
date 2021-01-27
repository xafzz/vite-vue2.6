import {emptyNode} from "../patch";


export default {
    create:updateDirectives,
    update:updateDirectives,
    destroy:function unbindDirectives(vnode){
        updateDirectives(vnode,emptyNode)
    }
}

function updateDirectives(oldVnode,vnode){

}

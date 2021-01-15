import {isDef, isObject} from "../../../shared/util";

//Runtime helper for rendering v-for lists.
// 就是 v-for
/*
    <div class="center" v-for="(item,key) in 10" :key="key">
        <p>{{ msg }},{{ changeComputed }},{{computedParams(2)}},item:{{item}},key:{{key}}</p>
    </div>
    通过 generate 生成的 _l 如下
    _l(
         // renderList 第一个参数 val
        (10),
        // renderList 第二个参数 render
        function(item,key){return _c('div',{key:key,staticClass:"center"},[_c('p',[_v(_s(msg)+","+_s(changeComputed)+","+_s(computedParams(2))+",item:"+_s(item)+",key:"+_s(key))]),_v(" ")])}
    )
*/
/**
 * @param val 就是 v-for,in后面的
 * @param render 通过 generate 生成 _l 的第二参数
 */
export function renderList(val, render){

    let ret,i,l,keys,key

    if( Array.isArray(val) || typeof val === 'string' ){  //数组
        console.log('没有写')
    }else if( typeof val ==='number' ){ //数字 我这正好用到的就是 数字
        //创建一个数组 数组的长度 就是 当前的值
        ret = new Array(val)
        for (i = 0; i < val ; i++) {
            ret[i] = render(i+1,i)
        }
        //ret 怎么是 undefined
        // 需要完成 _createElement return vnode 就有值了
    }else if( isObject(val) ){  // object
        console.log('没有写')

    }else{

        console.log('没有写')
    }

    if( !isDef(ret) ){
        ret = []
    }
    (ret)._isVlist = true
    return ret
}

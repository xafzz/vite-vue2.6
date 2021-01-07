import {toNumber, toString} from "../../../shared/util";


//用到了回来再补上
export function installRenderHelpers( target ){

    //将输入值转换为数字以保持持久性。如果转换失败，则返回原始字符串
    target._n = toNumber
    //将值转换为实际呈现的字符串。
    target._s = toString

    // ...

}

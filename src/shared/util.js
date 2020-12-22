
/**
 * Always return false.
 */
function no (a,b,c){ return false; }


function genStaticKeys( modules ){
    //reduce() 方法接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值。
    return modules.reduce((keys,m)=>{
        return keys.concat(m.staticKeys || [])
    },[]).join(',')
}

export {
    no,
    genStaticKeys
}
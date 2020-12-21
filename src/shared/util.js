
/**
 * Always return false.
 */
function no (a,b,c){ return false; }

function genStaticKeys( modules ){
    return modules.reduce((keys,m)=>{
        return keys.concat(m.staticKeys || [])
    },[]).join(',')
}

export {
    no,
    genStaticKeys
}
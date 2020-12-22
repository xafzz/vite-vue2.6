

function transformNode( el,options ){
    console.log('这应该是生成代码的时候才用到吧')
}

function genData(el){

    console.log('generate 才用吧')
}

export default {
    staticKeys:['staticClass'],
    transformNode,
    genData
}
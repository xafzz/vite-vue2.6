

export function initUse( Vue ){
    Vue.use = ( plugin ) => {
        console.log('用到的时候具体实现')
    }
}

export default function dom(id,html=''){
    if( html ){
        //是否是数组
        if( Array.isArray(id) ){
            id.forEach(val=>{
                document.querySelector(`#${val}`).innerHTML=html[val]
            })
        }else{
            console.log(id,html)
            document.querySelector(`#${id}`).innerHTML=html
        }
    }else{
        // let addButton = document.querySelector('#addButton')
        //main.js:21 Uncaught TypeError: Cannot read property 'addEventListener' of null
        // let addButton = document.getElementById('#addButton')
        return document.querySelector(`#${id}`)
    }
}
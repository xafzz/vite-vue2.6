<template>
<div class="main" style="background: red;border: 1px solid red;"  >
    <p>
    ddd
        <p>ddd</p>
    </p>
</div>
</template>

<script>
export default {
    name: 'App',
    data(){
        return {
            msg:1,
            show:true,
            list:[
                {name:1,age:2},
                {name:3,age:4},
                {name:5,age:6},
            ]
        }
    },
    methods:{
        tag(){
            console.log(11)
        }
    }
}
</script>
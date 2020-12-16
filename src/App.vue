<template>
<div id="main" class="main" style="background: red" >
    <div class="top">
        这是一段正常的文字br
    </div>
    <!-- 这是一段注释 -->
    <div class="center" >
        <p>{{ msg }}</p>
    </div>
    <div class="bottom">
        <a href="/" target="_blank" title="11" id="link" class="link" name="a">第三方的身份</a>
    </div>
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
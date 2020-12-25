<template>
<div class="child">
    this is children-{{msg}}
</div>
</template>

<script>
export default {
    name: "test",
    props:['msg']
}
</script>
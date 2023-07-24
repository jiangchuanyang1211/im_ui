<template>
    <div>hahahahahhaha</div>
</template>

<script>
export default {
  data(){
    return {

    }
  },
  created(){
    if ('EventSource' in window) {
        var source = new EventSource('../com/yh/myServlet/GetSession');

        source.onmessage = function(e) {
            console.log("message1:" + e.data);
        };
 
        source.onopen = function(e) {
            console.log("连接打开.");
        };
 
        source.onerror = function(e) {
            if (e.readyState == EventSource.CLOSED) {
                console.log("连接关闭");
            } else {
                console.log("onerror:" + e.readyState);
            }
        };
    } else {
        console.log("没有sse");
    }
  }
}
</script>

<style>

</style>
 
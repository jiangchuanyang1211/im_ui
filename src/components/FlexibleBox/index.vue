<template>
  <div id="dragLayoutBox">
    <!-- 左侧box -->
    <div class="left_box"  ref="flexibleBoxLeft"> 
      <slot name="left-content"></slot>
    </div>
    <!-- 中间调整按钮 -->
    <div class="mid">
      <div v-show="dragBtnFlag" class="drag_btn"></div>  
    </div>
    <!-- 右侧box -->
    <div class="right_box" ref="flexibleBoxRight">
      <slot name="right-content"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name :"FlexibleBox",
  props: {
    // 是否默认显示拖拽按钮
    dragBtnFlag: {
      typeof: Boolean,
      default: true
    },
    // 配置项
    setCssProps: {
      typeof: Object,
      default: () => ({
        // 左右盒子最小拖动宽度
        leftMinWidth: '280px',
        rightMinWidth: '500px',
        dragBtnCss: {
          mousedown: {
            background: '#919191'
          },
          onmouseup: {
            background: '#f8f8f9'
          }
        }
      })
    }
  },
  mounted() {
    this.dragChangeLayoutFn()
    window.addEventListener('resize', ()=>{
      const left_box = this.getDomFn('.left_box')
      const right_box = this.getDomFn('.right_box')
      const dragLayoutBox = this.getDomFn('#dragLayoutBox')
      if(right_box && right_box.style) {
        right_box.style.width = (dragLayoutBox.clientWidth - left_box.clientWidth - 20)  + 'px'
      }
    })
  
  },
  methods: {
    getDomFn(name) {
      const ele = document.querySelector(name)
      return ele
    },
    dragChangeLayoutFn() {
      const that = this
      const dragBtn = this.getDomFn('.drag_btn')
      const left_box = this.getDomFn('.left_box')
      const right_box = this.getDomFn('.right_box')
      const dragLayoutBox = this.getDomFn('#dragLayoutBox')
      dragBtn.onmousedown = function (e) {
        const styleStr = that.handleEleStyleFn(that.setCssProps.dragBtnCss.mousedown)
        dragBtn.style.cssText = `${styleStr}`
        const startPos = e.clientX
        dragBtn.left = dragBtn.offsetLeft
        document.onmousemove = e => {
          const endPos = e.clientX
          let moveW = dragBtn.left - 20 + (endPos - startPos)
          const maxW = dragLayoutBox.clientWidth - dragBtn.offsetWidth
          // 左边区域的最小宽度
          const leftValue = parseInt(that.setCssProps.leftMinWidth)
          if (moveW < leftValue) {
            moveW = leftValue
          }
          // 右边区域最小宽度
          const rightValue = parseInt(that.setCssProps.rightMinWidth)
          if (moveW > maxW - rightValue) {
            moveW = maxW - rightValue
          }
          left_box.style.cssText = `width:${moveW}px`
          right_box.style.width = dragLayoutBox.clientWidth - moveW - 20 + 'px'
        }
        document.onmouseup = () => {
          const styleStr = that.handleEleStyleFn(that.setCssProps.dragBtnCss.onmouseup)
          dragBtn.style.cssText = `${styleStr}`
          document.onmousemove = document.onmouseup = null
          if (that.iframeIsHave) {
            that.changeBoxStyleFn('none')
          }
          dragBtn.releaseCapture && dragBtn.releaseCapture()
        }
        dragBtn.setCapture && dragBtn.setCapture()
        return false
      }
    },
    // 处理传来的对象：{k1:"v1",k2:"v2"} => "k1:v1;k2:v2"
    handleEleStyleFn(obj) {
      let str = JSON.stringify(obj)
      const indexstart = str.indexOf('{')
      const indexEnd = str.indexOf('}')
      str = str.slice(indexstart + 1).slice(0, indexEnd - 1)
      const reg1 = /,/g
      const reg2 = /"|'/g
      return str.replace(reg1, ';').replace(reg2, '')
    }
  }
}
</script>

<style scoped>
#dragLayoutBox {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
}
.drag_btn {
  position: absolute;
  top: 20px;
  width: 5px;
  height: calc(100% - 40px);
  cursor: col-resize;
  background: #f8f8f9;
  border-radius: 5px;
  background-size: cover;
  background-position: center;
  font-size: 32px;
  color: white;
  z-index: 1112;
}
.left_box {
  width:  280px;
  min-width: 280px;
  height: 100%;
}
.mid {
  width:  20px;
  min-width: 20px;
  height: 100%;
  display:flex;
  justify-content:center;
  align-items:center;
}
.right_box {
  max-width: calc(100% - 300px);
  min-width: 550px;
  flex: 1;
  height: 100%;
}
::-webkit-scrollbar {
  width: 0;
  height: 10px;
}
</style>
<template>
  <div id="app">
  <el-row>
    <el-col :span="12" offset="6">
      <div class="slider-container">
        <el-slider
          v-model="sliderValue"
          :disabled="disabled"
          :min="minValue"
          :max="maxValue"
          :show-input="false"
          height="24px"
          class="slider"
          @change="onSliderChange"
        />
        <span class="slider-tip" :class="{ 'slider-success': isSuccess, 'slider-error': isError }">{{ tip }}</span>
      </div>
    </el-col>
  </el-row>
</div>
</template>
<script>
export default {
  name: "DragVerification",
  data() {
    return {
      minValue: 0,
    maxValue: 100,
    sliderValue: 0,
    successValue: 50, // 验证成功的值
    isSuccess: false, // 是否验证成功
    isError: false, // 是否验证失败
    disabled: false, // 是否禁用滑块
    };
  },
  computed: {
    tip() {
      if (this.isSuccess) {
        return '验证成功';
      } else if (this.isError) {
        return '验证失败';
      } else {
        return '请拖动滑块完成验证';
      }
    },
  },
  methods: {
    onSliderChange(value) {
      if (value >= this.successValue) {
        this.isSuccess = true;
        this.isError = false;
        this.disabled = true;
        setTimeout(() => {
          // 验证成功后一段时间内保持状态，随后重置状态并解除禁用
          this.sliderValue = 0;
          this.isSuccess = false;
          this.disabled = false;
        }, 1000);
      } else {
        this.isError = true;
        setTimeout(() => {
          this.isError = false;
        }, 500);
      }
    },
  },
};
</script>
<style >
  .slider-container {
  position: relative;
  height: 24px;
  padding-top: 4px;
}

.slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.slider-tip {
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -60px;
  width: 120px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  background-color: #67c23a;
  border-radius: 4px;
  cursor: default;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.slider-tip.slider-success {
  background-color: #67c23a;
}

.slider-tip.slider-error {
  background-color: #f56c6c;
}

.slider-tip.show {
  opacity: 1;
}
</style>
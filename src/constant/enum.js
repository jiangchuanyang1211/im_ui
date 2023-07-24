/** enum.js
 * 枚举工具类的定义
 * 可以全局使用this.$enum.getDescByValue()等等...
 */

const EnumUtil = {}

EnumUtil.install = function (Vue, data) {
  const constantInfo = data || {}
  const Enum = { ...data }
  /**
   * 根据枚举值获取描述
   * @param {*} constantName  枚举对象的名字
   * @param {*} value         枚举值
   * @param {*} desc          枚举值所对应的描述
   */
  Enum.getDescByValue = function (constantName, value) {
    if (!constantInfo.hasOwnProperty(constantName)) {
      return ''
    }
    let constantItem = constantInfo[constantName] // 通过传进来的名字拿到所对应的常量项
    for (let item in constantItem) {
      // 循环常量项
      if (constantItem[item].value === value) {
        return constantItem[item].desc
      }
    }
  }

  Vue.prototype.$enum = Enum // 挂在原型上，方便使用
}

export default EnumUtil

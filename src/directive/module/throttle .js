/**
 * 节流指令
 */
export default {
  inserted(el, binding) {
    el.addEventListener('click', e => {
      el.classList.add('is-disabled')
      el.disabled = true
      setTimeout(() => {
        el.disabled = false
        el.classList.remove('is-disabled')
      }, 2000)//我这里设置的是2000毫秒也就是2秒
    })
  },
}

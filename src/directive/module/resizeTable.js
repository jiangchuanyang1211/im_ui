const doResize = (el,binding,vnode) => {
  const { componentInstance: $table } = vnode
  const { value } = binding

  if(!value || value && !value.isResize) {
    return
  }
  if (!$table) {
    return
  }

  const bottomOffset = (value && value.bottomOffset) || 60
  const maxHeight = window.innerHeight - el.getBoundingClientRect().top - bottomOffset
  $table.layout.setMaxHeight(maxHeight, "max-height")
  $table.doLayout()
}
  
export default {
  bind(el, binding, vnode) { 
    el.resizeListener = () => {
      doResize(el,binding,vnode)
    }
    //addResizeListener(el, el.resizeListener)
    window.addEventListener('resize', el.resizeListener)
  },
  update(el,binding,vnode) {
    doResize(el,binding,vnode)
  },
  unbind(el) {
    //removeResizeListener(el, el.resizeListener)
    window.removeEventListener('resize',el.resizeListener)
  }
}
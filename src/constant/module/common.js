export const DELETE_SUCCESS = '删除成功'
export const ADD_SUCCESS = '新增成功'
export const EDIT_SUCCESS = '修改成功'
export const CLEAR_SUCCESS = '清空成功'
export const REFRESH_SUCCESS = '刷新成功'

export const NAME_RULE = { 
    pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/, 
    message: "仅能包含中文，英文字母，数字以及下划线", 
    trigger: "blur" 
}

export const CODE_RULE = { 
    pattern: /^[_a-zA-Z0-9]+$/, 
    message: "仅能包含英文字母，数字以及下划线", 
    trigger: "blur" 
}

export const LENGTH_RULE_2_20 = { 
    min:2, max: 20, 
    message: "长度需在2-20之间", 
    trigger: "blur"}

export const LENGTH_RULE_0_255 = { 
    max: 255, 
    message: "长度需在255字以内", 
    trigger: "blur"
}

export const REMARK_RULE = (rule, value, callback) => {
  if (!value || value === '') {
    callback();
  } else {
    const forbiddenChars = /(<|>|\/|\*|\&|\||%|\+)/g;
    if(forbiddenChars.test(value)){
      callback(new Error('输入不能包含特殊字符<>/ * & | % - +'));
    }else{
      callback();
    }
  }
};

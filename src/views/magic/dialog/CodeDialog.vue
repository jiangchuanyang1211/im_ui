<template>
    <el-dialog title="短信验证" :visible.sync="phoneVisible" width="20%" top="50%" :before-close="closeCodeDialog">
        <el-form :model="phoneForm" :rules="rules3" ref="phoneForm">
            <el-form-item prop="code">
                <el-row :gutter="20">
                    <el-col :span="16">
                        <el-input placeholder="请输入验证码" v-model="phoneForm.code">
                            <i slot="prefix" class="el-icon-tickets"></i>
                        </el-input>
                    </el-col>
                    <el-col :span="6">
                        <el-button @click="sendCode" :disabled="disabled">{{ btnText }}</el-button>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleCodeSubmit('phoneForm')">确定</el-button>
                <el-button @click="closeCodeDialog">取 消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
export default {
    name: 'CodeDialog',
    data() {
        var validateCode = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入验证码'));
            } else {
                if (!/^\d{6}$/.test(value)) {
                    callback(new Error('请输入6位数字'));
                }
                callback();
            }
        }
        return {
            phoneForm: {
                code: ''
            },
            rules3: {
                code: [
                    { required: true, trigger: "blur", message: "请输入验证码" },
                    { validator: validateCode, trigger: 'blur' },

                ],
            },
            btnText: "发送验证码",
            disabled: false,
        }
    },
    props: {
        phoneVisible: {
            type: Boolean,
            default: false
        },

    },
    methods: {
        closeCodeDialog() {
            this.$emit('closeCodeDialog');
            this.phoneForm.code = ""
        },
        sendCode() {
            alert(1)
        },
        handleCodeSubmit(formName) {
            this.$emit('handleSubmit', this.$refs[formName].validate,this.phoneForm.code)
        }
    }
}
</script>

<style></style>
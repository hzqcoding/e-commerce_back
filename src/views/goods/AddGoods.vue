<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card>
        <!-- 警告区域 -->
        <el-alert show-icon title="添加商品信息" center type="info" :closable="false"></el-alert>

        <!--步骤条-->
        <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>

        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
          <!-- tab 页签区域 -->
          <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addForm.goods_price" ></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addForm.goods_weight" ></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addForm.goods_number" ></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <!-- 选择商品分类的级联选择框 -->
                <el-cascader
                  :options="catelist"
                  :props="cascaderProps"
                  v-model="addForm.goods_cat"
                  @change="cateChanged"
                  clearable>
                </el-cascader>
              </el-form-item>
              <!-- 跳转下一步的按钮 -->
              <el-button type="primary" class="btn" @click="jumpNext">下一步</el-button>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1" >
              <!-- 渲染表单的Item项 -->
              <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                <!-- 复选框组 -->
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <!-- 跳转下一步的按钮 -->
              <el-button type="primary" class="btn" @click="jumpNext">下一步</el-button>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
              <!-- 跳转下一步的按钮 -->
              <el-button type="primary" class="btn" @click="jumpNext">下一步</el-button>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="handleSuccess">
                <el-button type="primary">点击上传</el-button>
              </el-upload>
              <!-- 跳转下一步的按钮 -->
              <el-button type="primary" class="btn" @click="jumpNext">下一步</el-button>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <!-- 富文本编辑器组件 -->
              <quill-editor v-model="addForm.goods_introduce"></quill-editor>
              <!-- 添加商品的按钮 -->
              <el-button type="primary" class="btn" @click="add">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>

      </el-card>

      <!-- 图片预览 -->
      <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
        <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>
    </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'AddGoods',
    data() {
      // 验证数字的规则
      var checkNum = (rule, value, cb) => {
        // 验证数字的正则表达式
        const regNum = /^[0-9]+(.[0-9]{0,3})?$/
        if (regNum.test(value)) {
          return cb()
        }
        cb(new Error('请输入合法的数字'))
      }
      return {
        activeIndex: '0',

        // 添加用户的表单数据
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          // 商品所属的分类数组
          goods_cat: [],
          //图片数组
          pics: [],
          // 商品的详情描述
          goods_introduce: '',
          attrs: []
        },

        // 添加表单的验证规则对象
        addFormRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' },
            { validator: checkNum, trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' },
            { validator: checkNum, trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' },
            { validator: checkNum, trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请选择商品分类', trigger: 'blur' }
          ]
        },

        //商品分类列表
        catelist: [],

        // 动态参数列表数据
        manyTableData: [],
        // 静态属性列表数据
        onlyTableData: [],

        //指定级联选择器的配置对象
        cascaderProps: {
          expandTrigger:'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
        },

        //上传图片的URL地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',

        // 图片上传组件的headers请求头对象
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },

        //预览图片路径
        previewPath: '',
        previewVisible: false,

      }
    },
    created () {
      this.getCateList()
    },
    methods: {
      //获取商品分类列表
      async getCateList () {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类列表失败！')
        }
        this.catelist = res.data
      },

      // 选择项发生变化触发这个函数
      // 获取参数的列表数据
      async cateChanged () {
        // 证明选中的不是三级分类
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
      },

      //跳转下一步
      jumpNext() {
        let num = Number(this.activeIndex)
        num ++
        if(this.beforeTabLeave(num.toString(),this.activeIndex)===false) {
          num --
        }
        this.activeIndex = num.toString()
        this.tabClicked()
      },

      //控制标签页切换
      beforeTabLeave(activeName, oldActiveName) {
        // console.log('即将离开的标签页名字是：' + oldActiveName)
        // console.log('即将进入的标签页名字是：' + activeName)
        if (oldActiveName === '0' ) {
          if (this.addForm.goods_cat.length !== 3) {
            this.$message.error('请先选择商品分类！')
            return false
          }else if (this.addForm.goods_name === '') {
            this.$message.error('请先填写商品名称！')
            return false
          }
        }
      },

      //标签页选中时触发
      async tabClicked() {
        // console.log(this.activeIndex)
        // 证明访问的是动态参数面板
        if (this.activeIndex === '1') {
          // 根据所选分类的Id，和当前所处的面板，获取对应的参数
          const { data: res } = await this.$http.get(
            `categories/${this.cateId}/attributes`,
            { params: { sel: 'many' } })

          if (res.meta.status !== 200) {
            return this.$message.error('获取动态参数列表失败！')
          }
          res.data.forEach(item => {
            //将字符串以空格为间隔 分开成数组
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            /*//将数组内的各个字符串重新分配id,写成一个个对象
            for (let i = 0,len = item.attr_vals.length;i < len;i++) {
              item.attr_vals[i] = {id:i,name:item.attr_vals[i]}
            }*/
          })
          this.manyTableData = res.data
          //console.log(this.manyTableData)

        }else if (this.activeIndex === '2') {
          const { data: res } = await this.$http.get(
            `categories/${this.cateId}/attributes`,
            {
              params: { sel: 'only' }
            }
          )

          if (res.meta.status !== 200) {
            return this.$message.error('获取静态属性失败！')
          }

          //console.log(res.data)
          this.onlyTableData = res.data
        }
      },

      // 处理图片预览效果
      handlePreview(file) {
        //console.log(file)
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },

      // 处理移除图片的操作
      handleRemove(file) {
        // console.log(file)
        // 1. 获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path
        // 2. 从 pics 数组中，找到这个图片对应的索引值
        const i = this.addForm.pics.findIndex(x => x.pic === filePath)
        // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
        this.addForm.pics.splice(i, 1)
        //console.log(this.addForm)
      },

      // 监听图片上传成功的事件
      handleSuccess(response) {
        //console.log(response)
        // 1. 拼接得到一个图片信息对象
        const picInfo = { pic: response.data.tmp_path }
        // 2. 将图片信息对象，push 到pics数组中
        this.addForm.pics.push(picInfo)
       //console.log(this.addForm)
      },

      add() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项！')
          }
          // 执行添加的业务逻辑
          // lodash   cloneDeep(obj)
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')
          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs = this.addForm.attrs
          //console.log(form)

          // 发起请求添加商品
          // 商品的名称，必须是唯一的
          const { data: res } = await this.$http.post('goods', form)

          //console.log(res.meta)
          if (res.meta.status !== 201) {
            //return this.$message.error('添加商品失败！')
            this.activeIndex = '0'
            return this.$message.error(res.meta.msg)
          }

          this.$message.success('添加商品成功！')
          this.$router.push('/goods')
        })
      }


    },
    computed: {
      // 当前选中的三级分类的Id
      cateId () {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      },
    }
  }
</script>

<style scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewImg {
    width: 100%;
  }

  .btn {
    margin-top: 15px;
  }

</style>

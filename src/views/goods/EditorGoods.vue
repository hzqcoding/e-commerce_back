<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
        <el-breadcrumb-item>修改商品</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card>
        <!-- 警告区域 -->
        <el-alert show-icon title="修改商品信息" center type="info" :closable="false"></el-alert>

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
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-position="top">
          <!-- tab 页签区域 -->
          <el-tabs v-model="activeIndex" tab-position="left" @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="editForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="editForm.goods_price" ></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="editForm.goods_weight" ></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="editForm.goods_number" ></el-input>
              </el-form-item>
              <el-form-item label="商品分类">
                <el-input v-model="listName" disabled></el-input>
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
              <div>原有商品图片</div>
              <div v-for="(imgsrc,i) in showURL" class="picsBox" >
                <img :src="imgsrc" alt="" class="pics" >
                <a class="pic-title" @click="preview(imgsrc)" >{{imgsrc}}</a>
                <div class="el-icon-close" @click="deleteMulPic(i)"></div></div>
              <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="handleSuccess">
                <el-button class="btn" type="primary">添加商品图片</el-button>
              </el-upload>
              <!-- 跳转下一步的按钮 -->
              <el-button type="primary" class="btn" @click="jumpNext">下一步</el-button>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <!-- 富文本编辑器组件 -->
              <quill-editor v-model="editForm.goods_introduce"></quill-editor>
              <!-- 添加商品的按钮 -->
              <el-button type="primary" class="btn" @click="edit">修改完成</el-button>
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
  export default {
    name: 'EditorGoods',
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
        editForm: {},

        // 添加表单的验证规则对象
        editFormRules: {
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
          ]
        },

        //商品分类列表
        catelist: [],

        // 动态参数列表数据
        manyTableData: [],
        // 静态属性列表数据
        onlyTableData: [],


        //上传图片的URL地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',

        // 图片上传组件的headers请求头对象
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },

        //预览图片路径
        previewPath: '',
        previewVisible: false,

        //商品分类名称
        listName:'',

        //展示原有图片的路径
        showURL:[]
      }
    },
    created() {
      this.getParams()
      this.getCateList()
      this.showPics()
    },
    watch: {
      // 监测路由变化,只要变化了就调用获取路由参数方法将数据存储本组件即可
      '$route': 'getParams'
    },
    methods: {
      //获取需修改的商品信息
      getParams(){
        // 取到路由带过来的参数
        var routerParams = this.$route.query.edit
        // 将数据放在当前组件的数据内
        this.editForm = routerParams
        //console.log(this.editForm)
      },

      //获取商品分类列表
      async getCateList () {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类列表失败！')
        }
        this.catelist = res.data
        this.show()
      },

      //获取商品分类名称
      show() {
        const list = new Promise((resolve, reject) =>{
          //根据this.editForm.cat_one_id在catelist中找出与之匹配的一级分类名称
          this.catelist.forEach(item1 => {
            if (item1.cat_id === this.editForm.cat_one_id) {
              this.listName = item1.cat_name
              resolve(item1.children)
            }
          })
        }).then(item => {
          //根据this.editForm.cat_two_id在children中找出与之匹配的二级分类名称
          let list
          item.forEach(item2 => {
            if (item2.cat_id === this.editForm.cat_two_id) {
              this.listName = this.listName + '/' + item2.cat_name
              list = item2.children
            }
          })
          return list
        }).then(item => {
          //根据this.editForm.cat_three_id在children中找出与之匹配的三级分类名称
          item.forEach(item3 => {
            if (item3.cat_id === this.editForm.cat_three_id) {
              this.listName = this.listName + '/' + item3.cat_name
            }
          })
        })
      },
      /*回调地狱难以获取深层次的分类名称！！！*/
       /* //根据this.editForm.cat_one_id在catelist中找出与之匹配的一级分类名称
        this.catelist.forEach(item1 => {
          if(item1.cat_id === this.editForm.cat_one_id){
            this.listName=item1.cat_name
          }
          //根据this.editForm.cat_two_id在children中找出与之匹配的二级分类名称
          item1.children.forEach(item2 => {
            if(item2.cat_id === this.editForm.cat_two_id){
              this.listName=this.listName + '/' + item2.cat_name
              console.log(this.listName)
            }
            console.log(item2.children)
            //根据this.editForm.cat_three_id在children中找出与之匹配的三级分类名称
            item2.children.forEach(item3 => {
              if (item3.cat_id === this.editForm.cat_three_id) {
                //console.log(item3.cat_name)
                this.listName=this.listName + '/' + item3.cat_name
                console.log(this.listName)
              }
            })
          })
        })*/

      //跳转下一步
      jumpNext() {
        let num = Number(this.activeIndex)
        num ++
        this.activeIndex = num.toString()
        this.tabClicked()
      },

      //标签页选中时触发
      async tabClicked() {
        // console.log(this.activeIndex)
        // 证明访问的是动态参数面板
        if (this.activeIndex === '1') {
          // 根据所选分类的Id，和当前所处的面板，获取对应的参数
          const { data: res } = await this.$http.get(
            `categories/${this.editForm.cat_three_id}/attributes`,
            { params: { sel: 'many' } })

          if (res.meta.status !== 200) {
            return this.$message.error('获取动态参数列表失败！')
          }
          res.data.forEach(item => {
            //将字符串以空格为间隔 分开成数组
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          })
          this.manyTableData = res.data
          //console.log(this.manyTableData)

        }else if (this.activeIndex === '2') {
          const { data: res } = await this.$http.get(
            `categories/${this.editForm.cat_three_id}/attributes`,
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

      // 处理原有图片预览效果
      preview(file) {
        this.previewPath = file
        this.previewVisible = true
      },
      // 处理添加图片预览效果
      handlePreview(file) {
        //console.log(file)
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },

      //展示原有图片小图
      showPics() {
        this.editForm.pics.forEach(item => {
          this.showURL.push(item.pics_sma_url)
          //console.log(this.showURL)
        })
      },

      //删除原有图片
      deleteMulPic(index) {
        this.editForm.pics.splice(index, 1)
        this.showURL.splice(index, 1)
      },

      // 处理移除图片的操作
      handleRemove(file) {
        // console.log(file)
        // 1. 获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path
        // 2. 从 pics 数组中，找到这个图片对应的索引值
        const i = this.editForm.pics.findIndex(x => x.pic === filePath)
        // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
        this.editForm.pics.splice(i, 1)
        //console.log(this.addForm)
      },

      // 监听图片上传成功的事件
      handleSuccess(response) {
        //console.log(response)
        // 1. 拼接得到一个图片信息对象
        const picInfo = { pic: response.data.tmp_path }
        // 2. 将图片信息对象，push 到pics数组中
        this.editForm.pics.push(picInfo)
        //console.log(this.editForm)
      },

      //提交修改
      edit() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项！')
          }

          // 发起请求添加商品
          // 商品的名称，必须是唯一的
          const { data: res } = await this.$http.put(
            'goods/' + this.editForm.goods_id,this.editForm)

          //console.log(res.meta)
          if (res.meta.status !== 200) {
            //return this.$message.error('添加商品失败！')
            this.activeIndex = '0'
            return this.$message.error(res.meta.msg)
          }

          this.$message.success('修改商品成功！')
          this.$router.push('/goods')
        })
      }
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

  .picsBox {
    overflow: hidden;
    width: 957px;
    height: 70px;
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 6px;
    padding: 10px 10px 10px 10px;
    margin-top: 10px;
  }

  .pics {
    width: 70px;
    height: 70px;
    border-radius: 2px;
    border: 1px solid #E5E9F2;
  }

  .pic-title {
    position: absolute;
    line-height: 70px;
    margin-left: 10px;
  }
  a:hover {
    color: #409EFF;
    cursor: pointer;
  }

  .el-icon-close {
    float: right;
    cursor: pointer;
    opacity: .75;
    color: #606266;
  }
</style>

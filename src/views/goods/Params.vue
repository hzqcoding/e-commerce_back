<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>分类参数</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card>
        <!-- 警告区域 -->
        <el-alert
          show-icon title="注意：只允许为第三级分类设置相关参数！"
          type="warning"
          :closable="false">
        </el-alert>

        <!-- 选择商品分类区域 -->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <!-- 选择商品分类的级联选择框 -->
            <el-cascader
              :options="catelist"
              :props="cascaderProps"
              v-model="selectedKeys"
              @change="cateChanged"
              clearable>
            </el-cascader>
          </el-col>
        </el-row>

        <!-- tab 页签区域 -->
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <!--动态-->
          <el-tab-pane label="动态参数" name="many">
            <!--按钮-->
            <el-button
              type="primary"
              size='mini'
              :disabled="isBtnDisabled"
              @click="addDialogVisible = true">
              添加参数
            </el-button>
            <!--表格-->
            <el-table class="tb_font" :data="manyTableData" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染Tag标签 -->
                  <el-tag
                    v-for="(item,i) in scope.row.attr_vals"
                    :key="i"
                    @close="handleClose(i,scope.row)"
                    closable>
                    {{item}}
                  </el-tag>
                  <!-- 输入的文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)">
                    + New Tag
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" ></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作" width="400px">
                <template slot-scope="scope">
                  <!-- 编辑按钮 -->
                  <el-button type="primary" icon="el-icon-edit" size='mini' @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <!-- 删除按钮 -->
                  <el-button type="danger" icon="el-icon-delete" size='mini' @click="removeParamsById(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!--静态-->
          <el-tab-pane label="静态属性" name="only">
            <!--按钮-->
            <el-button type="primary" size='mini' :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
            <!--表格-->
            <el-table class="tb_font" :data="onlyTableData" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染Tag标签 -->
                  <el-tag
                    v-for="(item,i) in scope.row.attr_vals"
                    :key="i"
                    @close="handleClose(i,scope.row)"
                    closable>
                    {{item}}
                  </el-tag>
                  <!-- 输入的文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)">
                    + New Tag
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作" width="400px">
                <template slot-scope="scope">
                  <!-- 编辑按钮 -->
                  <el-button type="primary" icon="el-icon-edit" size='mini' @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <!-- 删除按钮 -->
                  <el-button type="danger" icon="el-icon-delete" size='mini' @click="removeParamsById(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>

      </el-card>

      <!--添加参数/属性对话框-->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="120px">
          <el-form-item :label="titleText + '名称'" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
      </el-dialog>

      <!--修改参数/属性对话框-->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="120px">
          <el-form-item :label="titleText + '名称'" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamsInfo">确 定</el-button>
      </span>
      </el-dialog>
    </div>
</template>

<script>
  export default {
    name: 'Params',
    data() {
      return {
        //商品分类列表
        catelist: [],

        //级联选择框双向绑定到的数组
        selectedKeys: [],

        //指定级联选择器的配置对象
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
        },

        // 被激活的页签的名称
        activeName: 'many',
        // 动态参数的数据
        manyTableData: [],
        // 静态属性的数据
        onlyTableData: [],

        // 控制添加对话框的显示与隐藏
        addDialogVisible: false,

        // 添加的表单数据
        addForm: {
          attr_name: ''
        },

        // 添加表单的验证规则对象
        addFormRules: {
          attr_name: [
            {
              required: true,
              message: '请输入对应名称',
              trigger: 'blur'
            },
            {
              min: 2,
              max: 6,
              message: '名称的长度在2~6个字符之间',
              trigger: 'blur'
            }
          ]
        },

        // 控制修改角色对话框的显示与隐藏
        editDialogVisible: false,

        // 查询到的角色信息对象
        editForm: {},

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
      async cateChanged () {
        this.getParamsData()
      },

      // 获取参数的列表数据
      async getParamsData() {
        // 证明选中的不是三级分类
        if (this.selectedKeys.length !== 3) {
          this.selectedKeys = []
          this.manyTableData = []
          this.onlyTableData = []
          return
        }
        // 根据所选分类的Id，和当前所处的面板，获取对应的参数
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: this.activeName }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败！')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 控制文本框的显示与隐藏
          item.inputVisible = false
          // 文本框中输入的值
          item.inputValue = ''
        })
        //console.log(res.data)
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },

      // tab 页签点击事件的处理函数
      handleClick() {
        this.getParamsData()
      },

      // 监听添加对话框的关闭事件
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },

      // 点击按钮，添加新参数
      addParams () {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加参数的网络请求
          const { data: res } = await this.$http.post(
            `categories/${this.cateId}/attributes`,
            { attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            })

          if (res.meta.status !== 201) {
            this.$message.error('添加参数失败！')
          }
          this.$message.success('添加参数成功！')
          // 隐藏添加参数的对话框
          this.addDialogVisible = false
          // 重新获取参数列表数据
          this.getParamsData()
        })
      },

      // 展示编辑参数的对话框
      async showEditDialog (id) {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes/` +id,
          {attr_sel: this.activeName})
        if (res.meta.status !== 200) {
          return this.$message.error('查询参数信息失败！')
        }
        this.editForm = res.data
        this.editDialogVisible = true
      },

      // 监听修改参数对话框的关闭事件
      editDialogClosed () {
        this.$refs.editFormRef.resetFields()
      },

      // 修改参数信息并提交
      editParamsInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 发起修改角色信息的数据请求
          const { data: res } = await this.$http.put(
            `categories/${this.cateId}/attributes/` + this.editForm.attr_id,
            { attr_name: this.editForm.attr_name,
              attr_sel: this.activeName
            })
          if (res.meta.status !== 200) {
            return this.$message.error('更新参数信息失败！')
          }
          // 关闭对话框
          this.editDialogVisible = false
          // 刷新数据列表
          this.getParamsData()
          // 提示修改成功
          this.$message.success('更新参数信息成功！')
        })
      },

      // 根据Id删除对应的参数信息
      async removeParamsById (id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该参数信息, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)

        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消了删除，则返回值为字符串 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }

        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/` + id)

        if (res.meta.status !== 200) {
          return this.$message.error('删除参数信息失败！')
        }

        this.$message.success('删除参数信息成功！')
        this.getParamsData()
      },

      // 删除对应的参数可选项
      handleClose(i,row) {
        row.attr_vals.splice(i, 1);
        this.saveAttrVals(row)
      },

      // 点击按钮，展示文本输入框
      showInput(row) {
        row.inputVisible = true;
        // 让文本框自动获得焦点
        /*$nextTick 方法的作用，就是当页面上元素
        被重新渲染之后，才会指定回调函数中的代码*/
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },

      // 文本框失去焦点，或摁下了 Enter 都会触发
      handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputVisible = false
          row.inputValue = ''
          return
        }
        row.attr_vals.push(row.inputValue.trim())
        row.inputVisible = false
        row.inputValue = ''
        this.saveAttrVals(row)
      },

      // 将对 attr_vals 的操作，保存到数据库
      async saveAttrVals(row) {
        // 发起添加参数项的数据请求
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/` + row.attr_id,
          { attr_name: row.attr_name,
            attr_sel: this.activeName,
            attr_vals: row.attr_vals.join(' ')
          })
        if (res.meta.status !== 200) {
          return this.$message.error('更新参数项失败！')
        }
        // 提示修改成功
        this.$message.success('更新参数项成功！')
      }
    },
    computed: {
      // 如果按钮需要被禁用，则返回true，否则返回false
      isBtnDisabled() {
        if (this.selectedKeys.length !== 3) {
          return true
        }
        return false
      },

      // 当前选中的三级分类的Id
      cateId() {
        if (this.selectedKeys.length === 3) {
          return this.selectedKeys[2]
        }
        return null
      },
      // 动态计算标题的文本
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      }
    }
  }
</script>

<style scoped>
  .cat_opt {
    margin: 20px 0;
  }

  .tb_font {
    font-size: 14px!important;
  }

  .el-tag {
    margin: 7px;
    font-size: 12px;
  }

  .button-new-tag {
    margin-left: 7px;
    height: 32px;
  }
  .input-new-tag {
    width: 120px;
    margin-left: 7px;
  }

</style>

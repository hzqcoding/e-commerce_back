<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card>
        <!-- 添加分类区域 -->
        <el-row :gutter="20">
          <el-col :span="4">
            <el-button type="primary" @click="showAddDialog">添加分类</el-button>
          </el-col>
        </el-row>

        <!-- 商品分类列表区域 -->
        <tree-table
          class="treeTable"
          :data="catelist"
          :columns="columns"
          :selection-type="false"
          :expand-type="false"
          show-index
          index-text="#"
          :show-row-hover="false"
          border>
          <!-- 是否有效 -->
          <template slot="isdelete" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
            <i class="el-icon-error" v-else style="color: red;"></i>
          </template>

          <!-- 排序 -->
          <template slot="wlevel" slot-scope="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>

          <!-- 操作 -->
          <template slot="opt" slot-scope="scope">
             <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" @click="removeCateById(scope.row,scope.row.cat_id)">删除</el-button>
          </template>
        </tree-table>
      </el-card>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!--添加分类对话框-->
      <el-dialog
        title="添加分类"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              expand-trigger="hover"
              :options="parentCateList"
              :props="cascaderProps"
              v-model="selectedKeys"
              @change="parentCateChanged"
              clearable>
            </el-cascader>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
      </el-dialog>

      <!-- 修改分类的对话框 -->
      <el-dialog
        title="修改分类信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
        <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="分类名称">
            <el-input v-model="editForm.cat_name" prop="cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
      </el-dialog>
    </div>
</template>

<script>
  export default {
    name: 'Cate',
    data() {
      return {
        //查询条件
        queryInfo: {
          //商品分类层级
          type: 3,
          // 当前的页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 5,
        },
        //商品分类列表
        catelist: [],
        //总数据条数
        total: 0,

        // 控制添加用户对话框的显示与隐藏
        addDialogVisible: false,

        //为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            type: 'template',
            template: 'isdelete'
          },
          {
            label: '排序',
            type: 'template',
            template: 'wlevel'
          },
          {
            label: '操作',
            type: 'template',
            template: 'opt'
          }
        ],

        // 添加分类的表单数据
        addForm: {
          cat_name: '',
          cat_pid: 0,
          cat_level: 0
        },

        // 添加表单的验证规则对象
        addFormRules: {
          cat_name: [
            {
              required: true,
              message: '请输入分类名称',
              trigger: 'blur'
            }
          ]
        },

        // 父级分类的列表
        parentCateList: [],

        //指定级联选择器的配置对象
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true
        },

        //选中的父级分类的id数组
        selectedKeys: [],

        // 控制修改分类对话框的显示与隐藏
        editDialogVisible: false,

        // 查询到的分类信息对象
        editForm: {},
      }
    },
    created () {
      //获取所有的权限
      this.getCateList()
    },
    methods: {
      //获取商品分类列表
      async getCateList () {
        const { data: res } = await this.$http.get('categories' , { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类列表失败！')
        }
        //console.log(res.data)
        this.catelist = res.data.result
        this.total = res.data.total

      },

      // 监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },

      // 监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        //console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },

      //监听 分页索引
      handleIndex (index) {
        return (this.queryInfo.pagenum - 1) * this.queryInfo.pagesize + index + 1;
      },

      // 获取父级分类的数据列表
      async getParentCateList() {
        const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取父级分类数据失败！')
        }
        this.parentCateList = res.data
      },

      //展示添加分类对话框
      async showAddDialog () {
        this.getParentCateList()
        this.addDialogVisible = true
      },

      // 选择项发生变化触发这个函数
      parentCateChanged () {
        // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
        // 反之，就说明没有选中任何父级分类
        if (this.selectedKeys.length > 0) {
          // 父级分类的Id
          this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          // 为当前分类的等级赋值
          this.addForm.cat_level = this.selectedKeys.length
          return
        }else {
          // 父级分类的Id
          this.addForm.cat_pid = 0
          // 为当前分类的等级赋值
          this.addForm.cat_level = 0
        }
      },

      // 点击按钮，添加新分类
      addCate () {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('categories', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败！')
          }
          this.$message.success('添加分类成功！')
          this.getCateList()
          this.addDialogVisible = false
        })
      },

      // 监听添加分类对话框的关闭事件
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
        this.selectedKeys = []
        this.addForm.cat_level = 0
        this.addForm.cat_pid = 0
      },

      // 展示编辑分类的对话框
      async showEditDialog (id) {
        const { data: res } = await this.$http.get('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败！')
        }

        this.editForm = res.data
        this.editDialogVisible = true
      },

      // 监听修改分类对话框的关闭事件
      editDialogClosed () {
        this.$refs.editFormRef.resetFields()
      },

      // 修改分类信息并提交
      editCateInfo () {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 发起修改用户信息的数据请求
          const { data: res } = await this.$http.put(
            'categories/' + this.editForm.cat_id,
            { cat_name: this.editForm.cat_name }
          )
          if (res.meta.status !== 200) {
            return this.$message.error('更新用户信息失败！')
          }
          // 关闭对话框
          this.editDialogVisible = false
          // 刷新数据列表
          this.getCateList()
          // 提示修改成功
          this.$message.success('更新用户信息成功！')
        })
      },

      // 根据Id删除对应的分类信息
      async removeCateById (cate,id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该分类, 是否继续?',
          '提示',
          { confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning' }).catch(err => err)

        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消了删除，则返回值为字符串 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }

        const { data: res } = await this.$http.delete('categories/' + id)

        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败！')
        }

        this.$message.success('删除分类成功！')
        this.getCateList()
      },
    }
  }
</script>

<style scoped>
  .treeTable {
    margin-top: 15px;
    font-size: 16px;
  }
  .el-cascader {
    width: 100%;
  }
</style>

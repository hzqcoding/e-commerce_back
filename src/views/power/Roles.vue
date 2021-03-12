<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 权限列表区域 -->
      <el-table
        :data="rolesList.slice((pagenum - 1) * pagesize, pagenum * pagesize)"
        border
        stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom','vcenter', i1 === 0 ? 'bdtop' : '']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id" >
              <!--渲染一级权限-->
              <el-col
                :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row,item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <!--渲染二级权限-->
                <el-row
                  :class="['vcenter',i2 === 0 ? '' : 'bdtop']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id" >
                  <el-col :span="7">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--渲染三级权限-->
                  <el-col :span="17">
                    <el-tag
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" :index="handleIndex"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="400px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagenum"
        :page-sizes="[2, 4, 10]"
        :page-size="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="rolesList.length">
      </el-pagination>

    </el-card>

    <!--添加角色对话框-->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightsTree"
               :props="treeProps"
               show-checkbox node-key="id"
               default-expand-all
               :default-checked-keys="defKeys"
               ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data() {
      return {
        // 当前的页数
        pagenum: 1,

        // 当前每页显示多少条数据
        pagesize: 4,

        //角色列表
        rolesList: [],
        total: 0,

        // 控制添加角色对话框的显示与隐藏
        addDialogVisible: false,

        // 添加角色的表单数据
        addForm: {
          roleName: '',
          roleDesc: ''
        },

        // 添加表单的验证规则对象
        addFormRules: {
          roleName: [
            {
              required: true,
              message: '请输入角色名称',
              trigger: 'blur'
            },
            {
              min: 2,
              max: 8,
              message: '用户名的长度在2~8个字符之间',
              trigger: 'blur'
            }
          ],
          roleDesc: [
            {
              required: true,
              message: '请输入角色描述',
              trigger: 'blur'
            },
            {
              min: 4,
              max: 10,
              message: '用户名的长度在4~10个字符之间',
              trigger: 'blur'
            }
          ],
        },

        // 控制修改角色对话框的显示与隐藏
        editDialogVisible: false,

        // 查询到的角色信息对象
        editForm: {},

        // 修改表单的验证规则对象
        editFormRules: {
          roleDesc: [
            {
              required: true,
              message: '请输入角色描述',
              trigger: 'blur'
            },
            {
              min: 4,
              max: 10,
              message: '用户名的长度在4~10个字符之间',
              trigger: 'blur'
            }
          ]
        },

        // 控制分配权限对话框的显示与隐藏
        setRightDialogVisible: false,

        // 查询到的权限树
        rightsTree: [],

        // 树形控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },

        // 默认选中的节点Id值数组
        defKeys: [],

        // 当前即将分配权限的角色id
        roleId: ''
      }
    },
    created () {
      //获取所有的权限
      this.getRolesList()
    },
    methods: {
      //获取角色列表
      async getRolesList () {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败！')
        }
        this.rolesList = res.data
        //console.log(this.rolesList)
      },

      // 监听 pagesize 改变的事件
      handleSizeChange (newSize) {
        // console.log(newSize)
        this.pagesize = newSize
        this.getUserList()
      },

      // 监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        //console.log(newPage)
        this.pagenum = newPage
        this.getUserList()
      },

      //监听 分页索引
      handleIndex (index) {
        return (this.pagenum - 1) * this.pagesize + index + 1;
      },

      // 监听添加角色对话框的关闭事件
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },

      // 点击按钮，添加新角色
      addRole () {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加角色的网络请求
          const { data: res } = await this.$http.post('roles', this.addForm)

          if (res.meta.status !== 201) {
            this.$message.error('添加角色失败！')
          }
          this.$message.success('添加角色成功！')
          // 隐藏添加角色的对话框
          this.addDialogVisible = false
          // 重新获取角色列表数据
          this.getRolesList()
        })
      },

      // 展示编辑角色的对话框
      async showEditDialog (id) {
        const { data: res } = await this.$http.get('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询角色信息失败！')
        }

        this.editForm = res.data
        this.editDialogVisible = true
      },

      // 监听修改角色对话框的关闭事件
      editDialogClosed () {
        this.$refs.editFormRef.resetFields()
      },

      // 修改角色信息并提交
      editRoleInfo () {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 发起修改角色信息的数据请求
          const { data: res } = await this.$http.put(
            'roles/' + this.editForm.roleId,
            {
              roleName: this.editForm.roleName,
              roleDesc: this.editForm.roleDesc
            })
          if (res.meta.status !== 200) {
            return this.$message.error('更新角色信息失败！')
          }
          // 关闭对话框
          this.editDialogVisible = false
          // 刷新数据列表
          this.getRolesList()
          // 提示修改成功
          this.$message.success('更新角色信息成功！')
        })
      },

      // 根据Id删除对应的角色信息
      async removeRoleById (id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该角色, 是否继续?',
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

        const { data: res } = await this.$http.delete('roles/' + id)

        if (res.meta.status !== 200) {
          return this.$message.error('删除角色失败！')
        }

        this.$message.success('删除角色成功！')
        this.getRolesList()
      },

      // 根据Id删除对应的角色权限
      async removeRightById (role, id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该权限, 是否继续?',
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

        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`)

        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }

        this.$message.success('删除权限成功！')
        //this.getRolesList()
        role.children = res.data
      },

      // 展示分配权限的对话框
      async showSetRightDialog (role) {
        this.roleId = role.id
        // 获取所有权限的数据
        const { data: res } = await this.$http.get('rights/tree')

        if (res.meta.status !== 200) {
          return this.$message.error('获取权限数据失败！')
        }

        // 把获取到的权限数据保存到 data 中
        this.rightsTree = res.data
        //console.log(this.rightsTree)

        // 递归获取三级节点的Id
        this.getLeafKeys(role, this.defKeys)

        this.setRightDialogVisible = true
      },

      // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
      getLeafKeys (node, arr) {
        // 如果当前 node 节点不包含 children 属性，则是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }

        node.children.forEach(item => this.getLeafKeys(item, arr))
      },

      // 监听分配权限对话框的关闭事件
      setRightDialogClosed () {
        this.defKeys = []
      },

      // 点击为角色分配权限
      async allotRights () {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]

        const idStr = keys.join(',')

        const { data: res } = await this.$http.post(
          `roles/${this.roleId}/rights`,
          { rids: idStr }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('分配权限失败！')
        }

        this.$message.success('分配权限成功！')
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style scoped>
  .el-tag {
    margin: 10px;
    font-size: 16px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .bdright {
    border-top: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>

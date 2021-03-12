<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 权限列表区域 -->
      <el-table
        :data="rightsList.slice((pagenum - 1) * pagesize, pagenum * pagesize)"
        border
        stripe>
        <el-table-column type="index" :index="handleIndex"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="rightsList.length">
      </el-pagination>

    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Rights',
    data() {
      return {
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5,
        //权限列表
        rightsList: [],
        total: 0,
      }
    },
    created () {
      //获取所有的权限
      this.getRightsList()
    },
    methods: {
      //获取权限列表
      async getRightsList() {
        const {data: res} = await this.$http.get('rights/list')
        if(res.meta.status !==200) {
          return this.$message.error('获取权限列表失败！')
        }
        this.rightsList = res.data
        //console.log(res)
      },

      // 监听 pagesize 改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize)
        this.pagesize = newSize
        this.getRightsList()
      },

      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.pagenum = newPage
        this.getRightsList()
      },

      //监听 分页索引
      handleIndex(index) {
        return (this.pagenum-1)*this.pagesize+index+1;
      }
    }
  }
</script>

<style scoped>

</style>

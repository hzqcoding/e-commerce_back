<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card>
        <!-- 搜索与添加区域 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
              <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="goAddPage">添加商品</el-button>
          </el-col>
        </el-row>

        <!-- 商品列表区域 -->
        <el-table
          class="tb_font"
          :data="goodsList"
          border
          stripe>
          <el-table-column type="index" :index="handleIndex" width="45px"></el-table-column>
          <el-table-column label="商品名称" prop="goods_name" ></el-table-column>
          <el-table-column label="商品价格(元)" prop="goods_price" width="105px"></el-table-column>
          <el-table-column label="商品重量" prop="goods_weight"width="80px"></el-table-column>
          <el-table-column label="创建时间" prop="add_time" width="140px">
            <template slot-scope="scope">
              {{scope.row.add_time | dateFormat}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120px">
            <template slot-scope="scope">
              <!-- 修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(scope.row.goods_id)"></el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 20, 50]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
    </div>
</template>

<script>
  export default {
    name: 'GoodsList',
    data() {
      return {
        // 获取商品列表的参数对象
        queryInfo: {
          query: '',
          // 当前的页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 10
        },
        //商品列表
        goodsList: [],
        total: 0,
        editForm:{}
      }
    },
    created () {
      //获取所有的商品
      this.getGoodsList()
    },
    methods: {
      //获取商品列表
      async getGoodsList() {
        const {data: res} = await this.$http.get('goods',{ params: this.queryInfo })
        if(res.meta.status !==200) {
          return this.$message.error('获取商品列表失败！')
        }
        this.goodsList = res.data.goods
        this.total = res.data.total
        //console.log(res)
        //console.log(this.goodsList)
      },

      // 监听 pagesize 改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },

      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },

      //监听 分页索引
      handleIndex(index) {
        return (this.queryInfo.pagenum-1)*this.queryInfo.pagesize+index+1;
      },

      // 根据Id删除对应的商品信息
      async removeGoodsById (id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该商品, 是否继续?',
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

        const { data: res } = await this.$http.delete('goods/'+id)

        if (res.meta.status !== 200) {
          return this.$message.error('删除商品失败！')
        }

        this.$message.success('删除商品成功！')
        this.getGoodsList()
      },

      //跳转至添加商品页面
      goAddPage() {
        this.$router.push('/goods/add')
      },

      //跳转至修改商品页面
      goEditPage() {
        this.$router.push({path:'/goods/edit',query:{editForm}})
      },

      //根据id获取需修改的商品信息
      async showEditDialog(id) {
        //console.log(id)
        // 查询当前参数的信息
        const { data: res } = await this.$http.get('goods/'+id)

        if (res.meta.status !== 200) {
          return this.$message.error('获取参数信息失败！')
        }
        //console.log(res.data)
        this.editForm = res.data
        const data = res.data
        this.$router.push({path:'/goods/edit',query:{edit:data}})
      }
    }
  }
</script>

<style scoped>
  .tb_font {
    font-size: 14px!important;
  }
</style>

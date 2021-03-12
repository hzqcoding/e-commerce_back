<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card>
        <!-- 搜索与添加区域 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
              <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
            </el-input>
          </el-col>
        </el-row>

        <!-- 商品列表区域 -->
        <el-table
          class="tb_font"
          :data="ordersList"
          border
          stripe>
          <el-table-column type="index" :index="handleIndex" width="50px"></el-table-column>
          <el-table-column label="订单编号" prop="order_number" ></el-table-column>
          <el-table-column label="订单价格(元)" prop="order_price" width="110px"></el-table-column>
          <el-table-column label="是否付款" prop="pay_status"width="90px">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.pay_status === '1'">已付款</el-tag>
              <el-tag type="warning" v-else>未付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="是否发货" prop="is_send"width="80px"></el-table-column>
          <el-table-column label="下单时间" prop="create_time" width="160px">
            <template slot-scope="scope">
              {{scope.row.create_time | dateFormat}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150px">
            <template slot-scope="scope">
              <!-- 修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
              <!-- 删除按钮 -->
              <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
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

      <!-- 修改地址的对话框 -->
      <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
      </el-dialog>

      <!-- 展示物流进度的对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
        <!-- 时间线 -->
        <el-timeline>
          <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </div>
</template>

<script>
  import cityData from './citydata.js'

  export default {
    name: 'Order',
    data() {
      return {
        queryInfo: {
          query: '',
          // 当前的页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 10
        },
        ordersList:[],
        total: 0,

        addressVisible: false,

        addressForm: {
          address1: [],
          address2: ''
        },

        addressFormRules: {
          address1: [
            { required: true, message: '请选择省市区县', trigger: 'blur' }
          ],
          address2: [
            { required: true, message: '请填写详细地址', trigger: 'blur' }
          ]
        },

        cityData,

        progressVisible: false,

        progressInfo: []
      }
    },
    created () {
      this.getOrdersList()
    },
    methods: {
      //获取订单列表
      async getOrdersList() {
        const {data: res} = await this.$http.get('orders',{ params: this.queryInfo })
        if(res.meta.status !==200) {
          return this.$message.error('获取订单列表失败！')
        }
        this.ordersList = res.data.goods
        this.total = res.data.total
      },

      // 监听 pagesize 改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getOrdersList()
      },

      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getOrdersList()
      },

      //监听 分页索引
      handleIndex(index) {
        return (this.queryInfo.pagenum-1)*this.queryInfo.pagesize+index+1;
      },

      // 展示修改地址的对话框
      showBox() {
        this.addressVisible = true
      },

      //监听修改地址对话框的关闭事件
      addressDialogClosed() {
        this.$refs.addressFormRef.resetFields()
      },

      async showProgressBox() {
        const { data: res } = await this.$http.get('/kuaidi/1106975712662')

        if (res.meta.status !== 200) {
          return this.$message.error('获取物流进度失败！')
        }

        this.progressInfo = res.data

        this.progressVisible = true
        //console.log(this.progressInfo)
      }
    }
  }
</script>

<style scoped>

  .tb_font {
    font-size: 14px!important;
  }

  .el-cascader {
    width: 100%;
  }
</style>

<template>
  <div class="mainHeader">
    <div >
      <img src="~assets/img/heima.png" alt="">
      <span>电商后台管理系统</span>
    </div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
  export default {
    name: 'MainHeader',
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
    }
  }
</script>

<style lang="less" scoped>
  .mainHeader {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 20px;
    >div {
      display: flex;
      align-items: center;
      margin-left: 15px;
      >span {
        margin-left: 15px
      }
    }
    .el-button {
      margin-right: 25px;
    }
  }
</style>

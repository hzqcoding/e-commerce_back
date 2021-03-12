<template>
  <el-container class="home-container">
    <!--头部区域-->
    <el-header>
      <main-header/>
    </el-header>
    <!--页面主体-->
    <el-container>
      <!--侧边栏-->
      <aside-item/>
      <!--内容主体-->
      <el-main >
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  import MainHeader from 'content/header/MainHeader'
  import AsideItem from 'content/aside/AsideItem'

  export default {
    name: 'Home',
    components: {
      MainHeader,
      AsideItem
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    padding: 0;
  }
  .el-main {
    background-color: #eaedf1;
  }
</style>

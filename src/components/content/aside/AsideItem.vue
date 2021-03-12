<template>
  <el-aside :width="isCollapse ? '64px' : '200px'">
    <div class="toggle-button" @click="toggleCollapse(isCollapse)">|||</div>
    <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409EFF"
      unique-opened
      :collapse="isCollapse"
      :collapse-transition="false"
      router
      :default-active="activePath">
      <!--一级菜单-->
      <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
        <!--一级菜单模板区域-->
        <template slot="title">
          <!--图标&文本-->
          <i :class="iconsObj[item.id]"></i>
          <span>{{item.authName}}</span>
        </template>
        <!--二级菜单-->
        <el-menu-item
          :index="'/' + subItem.path"
          v-for="subItem in item.children"
          :key="subItem.id"
          @click="saveNavState('/' + subItem.path)">
          <!--二级菜单模板区域-->
          <template slot="title">
            <!--图标&文本-->
            <i class="el-icon-menu"></i>
            <span>{{subItem.authName}}</span>
          </template>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
  export default {
    name: 'AsideItem',
    data() {
      return {
        //菜单数据
        menulist: [],
        iconsObj: {
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao'
        },
        // 是否折叠
        isCollapse: false,
        // 被激活的链接地址
        activePath: ''
      }
    },
    created () {
      this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      //获取所有的菜单
      async getMenuList() {
        const { data: res } = await this.$http.get('menus')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menulist = res.data
        //console.log(res)
      },
      // 点击按钮，切换菜单的折叠与展开
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      // 保存链接的激活状态
      saveNavState(activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style scoped>
  .el-aside {
    overflow: hidden;
    background-color: #333744;
  }
  .iconfont {
    margin-right: 10px;
  }
  .el-menu {
    border-right: none;
  }
  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

</style>

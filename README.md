# vote-system

### 环境搭建
1. 安装 Docker、Docker-compose
2. 配置 docker-compose.yml 里的服务环境变量
>
    - ADMIN_EMAIL=管理员邮箱
    - SEND_EMAIL=验证邮件发送邮箱
    - SEND_PWD=验证邮件发送邮箱密码
3. 构建镜像 `docker-compose build`
4. 创建容器 `docker-compose up -d`
5. 使用 MySQL 客户端连接 MySQL 容器，创建数据库 `vote-system`（utf8字符集），运行 SQL 文件 `./vote-system.sql`
6. 访问 `http://127.0.0.1:3002`

### 接口文档
1. 执行 `apidoc -i app -o apidoc` 生成接口文档
2. 打开 `./apidoc/index.html` 查看文档

### 测试
1. 安装依赖文件 `npm install`
2. 安装 mocha `npm install mocha -g`
3. 修改 `./app/Configs/local` 里的配置文件，配置数据库信息，邮件信息等
> 默认配置为当前容器数据库，忽略`email`配置会warning，但不影响测试
4. 执行接口测试和单元测试 `mocha test`
> 注意：应避免测试环境与开发环境使用相同数据库，执行测试会产生测试数据
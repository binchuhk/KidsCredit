# KidsCredit 小朋友积分

手机优先的家庭积分 Web：家长给孩子加分，孩子申请兑换礼物/权利，家长审批。

## 功能

- 家长注册家庭（或邀请码加入），创建孩子账号
- 任务加分：象棋赢一盘 +10、游泳一次 +5（可自定义）
- 兑换：小礼物 30 分等；孩子申请，家长批准后扣分
- 数据存在服务端 SQLite，多家长可同时登录

## 本地运行（开发）

```bash
npm install
npx prisma db push
npm run dev
```

## 长期后台运行

已用 systemd 用户服务托管，关掉终端也会继续跑，开机后也会自动拉起：

```bash
npm run service:start     # 启动
npm run service:stop      # 停止
npm run service:restart   # 重启
npm run service:status    # 状态
npm run service:logs      # 日志
```

改代码后：

```bash
npm run build && npm run service:restart
```

浏览器打开 [http://localhost:3001](http://localhost:3001)，手机同网用 `http://电脑局域网IP:3001`。

## 试用流程

1. `/register` 创建家长账号与家庭
2. 家长首页添加孩子账号
3. 进入孩子详情，点「象棋赢一盘」等任务加分
4. 用孩子账号登录，申请「小礼物」
5. 家长在「审批」页批准

## 技术

Next.js 15 · Prisma · SQLite · iron-session · bcryptjs

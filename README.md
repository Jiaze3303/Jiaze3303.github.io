# 📷 Photo Gallery

极简风格的静态摄影展示网站，灵感来自 ChronoFrame。往 GitHub 丢照片，网站自动构建部署。

## ✨ 特性

- **零配置** — 把照片放进 `images/` 文件夹，push 即可
- **EXIF 自动提取** — 相机、镜头、光圈、快门、ISO、焦段
- **相册支持** — 子文件夹自动变成相册标签
- **瀑布流布局** — 自适应响应式，手机电脑都能看
- **灯箱模式** — 全屏浏览，EXIF 侧边栏，键盘/触摸翻页
- **暗色/亮色主题** — 默认暗色，一键切换
- **懒加载** — 滚动到才加载，不浪费流量
- **GitHub Pages 免费托管** — 自动部署，不需要服务器

## 🚀 快速开始

### 1. Fork 或 Clone 本仓库

### 2. 开启 GitHub Pages
- 进入仓库 **Settings → Pages**
- Source 选择 **GitHub Actions**

### 3. 添加照片
把图片丢进 `images/` 文件夹：

```
images/
├── 2024/
│   ├── 夕阳.jpg
│   └── 人像.jpg
├── 2025/
│   ├── 街拍.jpg
│   └── 风景.jpg
└── 随手拍.jpg          ← 根目录 = 无相册分类
```

### 4. 推送
```bash
git add .
git commit -m "添加照片"
git push
```

GitHub Actions 会自动构建并部署你的画廊。

## 📁 目录结构

```
photo-gallery/
├── images/              ← 📷 照片放这里！
│   ├── 2024/            ← 子文件夹 = 相册名
│   │   └── photo.jpg
│   └── 2025/
│       └── photo.jpg
├── build.py             ← 构建脚本（扫描图片、提取 EXIF）
├── index.html           ← 页面模板
├── style.css            ← 样式文件
├── app.js               ← 前端逻辑（灯箱、懒加载、主题切换）
├── favicon.svg          ← 网站图标
└── .github/
    └── workflows/
        └── deploy.yml   ← 自动构建部署
```

## 🎨 自定义

### 改网站标题
编辑 `index.html`，找到 `<h1 class="site-title">Gallery</h1>`，把 `Gallery` 改成你的标题。

### 改主题色
编辑 `style.css`，修改 `--accent: #d4a574`（默认暖金色），换成你喜欢的颜色。

### 支持的图片格式
`.jpg` `.jpeg` `.png` `.webp` `.gif` `.avif`

## 📝 工作原理

1. 你把照片 push 到 `images/` 文件夹
2. GitHub Actions 触发 `build.py`
3. `build.py` 扫描所有图片，提取 EXIF 元数据
4. 生成静态 `index.html`，照片数据内嵌其中
5. 部署到 GitHub Pages

不需要服务器，不需要数据库，不需要 API 密钥。纯静态文件。

## License

MIT

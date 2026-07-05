# 📷 JIAZE Photography

徕卡风格极简摄影展示网站。上传照片到 GitHub，自动构建部署。

**🔗 在线访问：https://jiaze3303.github.io**

---

## 🚀 如何更新照片

### 方法一：GitHub 网页上传（推荐）

1. 打开仓库 https://github.com/Jiaze3303/Jiaze3303.github.io
2. 进入 `images/` 文件夹，选择或创建子文件夹（如 `2025/`、`2024/`）
3. 点击 **Add file → Upload files**
4. 拖入照片，点 **Commit changes**
5. 等待 1-2 分钟，GitHub Actions 自动构建部署
6. 刷新网站即可看到新照片

### 方法二：命令行操作

```bash
# 克隆仓库
git clone https://github.com/Jiaze3303/Jiaze3303.github.io.git
cd Jiaze3303.github.io

# 放入照片（复制到 images/ 对应文件夹）
cp ~/Photos/新照片.jpg images/2025/

# 提交推送
git add .
git commit -m "添加新照片"
git push

# 自动构建部署，1-2分钟后刷新网站
```

---

## 📁 文件夹结构

```
images/
├── 2024/              ← 子文件夹 = 相册分类
│   ├── 照片A.jpg
│   └── 照片B.jpg
├── 2025/
│   ├── 照片C.jpg
│   └── 照片D.jpg
└── 随手拍.jpg          ← 根目录 = 无分类
```

**规则：**
- `images/` 下的子文件夹名 = 相册名（显示在顶部导航）
- 支持格式：`.jpg` `.jpeg` `.png` `.webp` `.gif` `.avif`
- 图片会自动压缩，无需手动处理
- 按文件名排序，建议用日期命名（如 `2025-01-01_街拍.jpg`）

---

## 🎨 网站功能

- **徕卡风格** — 黑灰白配色 + 红色点缀
- **瀑布流布局** — 自适应 4列/3列/2列/1列
- **灯箱浏览** — 点击看大图，左右键/触摸翻页
- **模糊背景** — 灯箱背景是当前图片的高斯模糊
- **暗色/亮色** — 一键切换主题
- **随机 Hero** — 每次刷新首页背景随机选一张照片
- **相册筛选** — 顶部导航按文件夹分类筛选
- **懒加载** — 滚动到才加载，节省流量

---

## ⚙️ 自定义

### 改网站标题
编辑 `index.html`，搜索 `JIAZE` 替换为你的名字。

### 改主题色（红色）
编辑 `style.css`，搜索 `#E52528` 替换为你喜欢的颜色。

### 改 Hero 引言
编辑 `index.html`，搜索 `"用光影记录世界的每一个瞬间"` 修改。

---

## 🔧 技术栈

- 纯静态 HTML/CSS/JS
- Python 构建脚本（提取 EXIF）
- GitHub Actions 自动部署
- GitHub Pages 托管

## License

MIT

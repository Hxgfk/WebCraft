# WebCraft(正在开发中)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![WebGL Support](https://img.shields.io/badge/WebGL-required-orange.svg)](#browser-requirements)

**在浏览器中体验完整的 Minecraft 1.19.2 版本！**  
⚠️ **多人游戏功能正在开发中**

---

## 🚨 重要声明
根据 **Minecraft 最终用户许可协议 (EULA)**：  
🔹 本项目 **不包含任何 Minecraft 游戏资源文件**  
🔹 您必须 **拥有正版 Minecraft Java 版**  
🔹 所有资源文件需 **用户自行提供**  
🔹 本项目与 Mojang/Microsoft **无任何关联**

非 **Mojang/Minecraft** 游戏资源：<br>
🔹 字体文件由[Minebbs YYT](https://www.minebbs.com/members/yyt.1/)大佬制作

---

## 📃 关于
WebCraft 是 Minecraft 的 Web 版本。它提供基本的图形游戏支持。

这个项目并不意味着要成为 Minecraft 的“克隆”，而是尝试以一种不同的方式重新创建游戏，整体外观和感觉与原始游戏相同，并提供额外的功能支持。

---

## ✨ 核心特性
| 功能 | 状态 | 说明                                                                            |
|------|------|-------------------------------------------------------------------------------|
| **多维度世界生成** | ✅ 完整支持 | 包括主世界、下界、末地                                                                   |
| **游戏模式系统** | ✅ 完整支持 | 生存/创造/冒险/旁观模式                                                                 |
| **光影包支持** | ✅ 基础支持 | 支持完整 Iris 光影包                                                                 |
| **红石系统** | ✅ 基础支持 | 基本电路与机械                                                                       |
| **生物AI系统** | ✅ 基础支持 | 敌对/中立/被动生物                                                                    |
| **多人游戏** | 🔜 开发中 | 基于 [WebSocket Proxy](https://github.com/Hxgfk/WebSocketProxy) 的多人游戏，可以与原版进行联机 |
| **导入/出存档** | ✅ 完整支持 | 可以导入Minecraft存档，也可以导出自定义存档格式                                                  |

---

## 🌐 浏览器要求
- **必需**: WebGL 2.0 支持 ([检测您的浏览器](https://get.webgl.org/))
- 推荐浏览器:  
  ![Chrome](https://img.shields.io/badge/Chrome-✓-green) ![Firefox](https://img.shields.io/badge/Firefox-✓-green) ![Edge](https://img.shields.io/badge/Edge-✓-green)
- 不支持: Safari < 15.4, Internet Explorer

---

## 🚀 快速开始

### 步骤 1: 克隆仓库
```bash
git clone https://github.com/Hxgfk/WebCraft.git
cd WebCraft
```

### 步骤 2: 准备资源文件 
* 因 Mojang EULA 许可问题，本项目无法提供任何游戏资源文件，需用户自行处理
1. **确保您拥有正版 Minecraft Java 版**
2. 定位资源文件夹：
    - **Windows**: `%AppData%\.minecraft\versions\1.19.2`
    - **macOS**: `~/Library/Application Support/minecraft/versions/1.19.2`
    - **Linux**: `~/.minecraft/versions/1.19.2`
3. 复制文件到项目assets目录:
4. 访问 [官方api](https://piston-meta.mojang.com/v1/packages/a9c8b05a8082a65678beda6dfa2b8f21fa627bce/1.19.json)复制内容然后在assets创建文件objects.json，粘贴在api中复制的内容。
- 客户端文件中数据文件夹data在assets目录以上
- 务必把data/minecraft中的文件复制到assets/minecraft中
- 确保有以下文件结构：
   ```markdown
   📁 WebCraft/  
   └── 📁 assets/  
       ├── 📁 objects/
       └── 📁 minecraft/
            ├── 📁 textures/
            └── 📁 data/
               ├── 📁 advancements/
               ├── 📁 loot_tables/
               ├── 📁 recipes/
               ├── 📁 structures/
               └── 📁 tags/
            ├── 📁 particles/
            ├── 📁 blockstates/
            ├── 📁 texts/
            ├── 📁 shaders/ 
            ├── 📁 models/
            ├── 📁 lang/
            └── objects.json
   ```

### 步骤 3: 安装依赖
```bash
npm install  # 安装依赖
```

### 步骤 4: 编译代码
```bash
npm run build
```

### 访问 ➡️ [main.html](./main.html) 开始游戏！

---

## 🧩 安装光影包
1. 打开 选项 > 视频设置 > 光影包
2. 点击上传光影包
3. 点击启用光影包

---

## ❓ 常见问题
### 为什么需要自己准备资源文件？
根据 Minecraft EULA 规定，直接分发游戏资源属于侵权行为。用户必须从合法拥有的游戏中提取资源。

### 如何参与开发？
欢迎贡献代码！请：
1. Fork本仓库
2. 进行您的开发（请务必测试完全以确保稳定运行）

---

## 📜 许可协议
本项目代码采用 **GPLv3 许可证** - 详见 [LICENSE](LICENSE)  
Minecraft 是 Mojang Studios 的商标，本项目与其无关联
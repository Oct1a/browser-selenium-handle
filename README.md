# 使用Selenium配合多指纹浏览器（猫头鹰）模拟操作提取ck

> 这种好处是配合代理ip进行真实提取，但缺点是太慢
>
> 现在这份代码原先用于提取tiktok的ck，目前应该用不了，可自行参考进行改进成其他脚本
>
> 说明：脚本仅供交流学习使用，请勿用于非法操作



## 📌脚本功能

1. 自动生成浏览器各种参数（随机计算机名、屏幕大小、内存信息、用户名、显卡信息等等）
2. 随机选择浏览器版本
3. 在线提取IP进行代理
4. 读取本地表格数据进行模拟输入登录
5. 自动关闭浏览器重新开始切换



## 👉使用步骤

### 1.  安装环境

- **window**

- **python**

在脚本文件夹下运行命令

```bash
pip install -r requirement.txt
```



### 2.  打开文件夹"OwlBrowser-1.1.6.1"下的"OwlBrowser.exe"进行登录/注册

> 注册猫头鹰浏览器会默认送个1块钱给你试用的、
>
> 如果没注册直接操作脚本是无法运行的



![image-20221013153736034](http://img.oct1a.cn/202210131537112.png)

![Snipaste_2022-10-13_15-34-42](http://img.oct1a.cn/202210131539129.jpg)



### 3.  运行

运行命令

```bash
python selenium_main.py
```



### 4.  提示

   如果想要更多的随机性，在目录```OwlBrowser-1.1.6.1\chromedrivers```内多增加几个不同版本的浏览器内核

​	下载地址：[chromedriver.storage.googleapis.com/index.html](http://chromedriver.storage.googleapis.com/index.html)
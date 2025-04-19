#3D模型生成与渲染平台

这是成都信息工程大学(CUIT)计算机学院AICG实验室项目，该实验室基于人工智能、计算机图形学、计算机视觉开展研究。该项目基于3D高斯重建以及气象生产技术，实现了一款多功能、快捷的视频转模型，图生图工具。
其中对于.ply文件的渲染参照了[t3d-gaussian-splatting](https://github.com/uinosoft/t3d-gaussian-splatting)并且项目中拥有[演示demo](https://uinosoft.github.io/t3d-gaussian-splatting/examples/)。

##Usage

####前端

你可以使用以下命令安装http-server以运行前端代码：

	npm install -g http-server

运行前端代码可输入：

	http-server

在浏览器打开对应URL即可，例如，在浏览器搜索框输入：

	http://localhost:8080/obj_rendering.html
    

####后端

你可以使用以下命令安装一些必要的依赖：

	pip install flask werkzeug flask-cors
	…… ……
	……

运行后端代码可输入：

	python app.js

注意，这只是一个平台框架，后端基于三维重建的方法在其他成员仓库内，可持续关注本仓库以获取更多信息。

##Reference

[t3d-gaussian-splatting](https://github.com/uinosoft/t3d-gaussian-splatting) - shawn0326

[3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/) - SIGGRAPH 2023

[GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D) - Three.js-based implementation of 3D Gaussian splatting

[GaussianSplattingMesh](https://github.com/BabylonJS/Babylon.js/blob/master/packages/dev/core/src/Meshes/GaussianSplatting/gaussianSplattingMesh.ts) - Babylon-based GaussianSplattingMesh
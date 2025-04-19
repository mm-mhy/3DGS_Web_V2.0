# 3DGS_Web_V2.0

This is a project of AICG Lab, School of Computer Science, Chengdu University of Information Engineering (CUIT), which carries out research based on Artificial Intelligence, Computer Graphics, and Computer Vision. The project is based on 3D Gaussian reconstruction as well as weather production technology, and implements a multi-functional and fast video-to-model, graph-to-graph tool.
The rendering of the .ply files references [t3d-gaussian-splatting](https://github.com/uinosoft/t3d-gaussian-splatting) and the project has [demo](https://uinosoft.github.io/t3d-gaussian-splatting/examples/).

## Usage

#### CLIENT

You can use the following command to install http-server to run the front-end code:

	npm install -g http-server

Running front-end code can be entered:

	http-server

Just open the corresponding URL in your browser, e.g., enter it in the browser search box:

	http://localhost:8080/obj_rendering.html
    

#### SERVER

You can use the following command to install some of the necessary dependencies:

	pip install flask werkzeug flask-cors
	…… ……
	……

Running server-side code can be entered:

	python app.js

Note that this is only a platform framework, the back-end 3D reconstruction based approach is within other member repositories, keep watching this repository for more information.

## Reference

[t3d-gaussian-splatting](https://github.com/uinosoft/t3d-gaussian-splatting) - shawn0326

[3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/) - SIGGRAPH 2023

[GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D) - Three.js-based implementation of 3D Gaussian splatting

[GaussianSplattingMesh](https://github.com/BabylonJS/Babylon.js/blob/master/packages/dev/core/src/Meshes/GaussianSplatting/gaussianSplattingMesh.ts) - Babylon-based GaussianSplattingMesh
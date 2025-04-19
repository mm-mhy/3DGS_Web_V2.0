// 导入必要的库和组件
import * as t3d from 't3d';
import { ForwardRenderer } from 't3d/addons/render/ForwardRenderer.js';
import { OrbitControls } from 't3d/addons/controls/OrbitControls.js';
import { ViewControls } from 't3d/addons/controls/ViewControls.js';
import { Timer } from 't3d/addons/misc/Timer.js';
import { SplatLoader, PLYLoader } from 't3d-gaussian-splatting';

let width = 800;
let height = 600;
// 初始化窗口尺寸
// 创建画布并添加到页面
const render_ply_window = document.getElementById('render_ply_window');
const ply_canvas = document.createElement('canvas');
ply_canvas.width = width;
ply_canvas.height = height;
render_ply_window.appendChild(ply_canvas);
// 初始化前向渲染器
const forwardRenderer = new ForwardRenderer(ply_canvas);
// 检查 WebGL2 支持
if (forwardRenderer.capabilities.version < 2) {
    document.getElementById('notSupported').style.display = '';
    throw new Error('不支持 WebGL2！');
}
// 创建场景
const ply_scene = new t3d.Scene();
// 创建相机并添加到场景
const ply_camera = new t3d.Camera();
ply_scene.add(ply_camera);
// 创建轨道控制器
const controller = new OrbitControls(ply_camera, ply_canvas);

// 创建视图控制器
const viewControls = new ViewControls(ply_camera, {
    target: controller.target,
    up: controller.up,
    style: 'position:absolute;bottom:0;left:0;opacity:0.9;z-index:99;user-select:none;'
});
render_ply_window.appendChild(viewControls.domElement);

// 创建网格容器并添加到场景
const meshContainer = new t3d.Object3D();
ply_scene.add(meshContainer);

// 显示网格函数和相机参数
let mesh, cameraNear = 0.1, cameraFar = 1000;
function showMesh({ buffer, node }) {
    // 如果已有网格，先移除并释放资源
    if (mesh) {
        meshContainer.remove(mesh);
        mesh.dispose();
    }
    mesh = node;
    // 获取包围球
    const boundingSphere = mesh.geometry.boundingSphere;
    // 设置相机和控制器目标
    controller.target.set(0, 0, 0);
    ply_camera.position.copy(new t3d.Vector3(0, boundingSphere.radius * 0.8, boundingSphere.radius * 2));
    mesh.position.copy(boundingSphere.center).negate();
    // 根据模型大小调整相机参数
    cameraNear = boundingSphere.radius * 0.01, cameraFar = boundingSphere.radius * 10;
    ply_camera.setPerspective(45 / 180 * Math.PI, width / height, cameraNear, cameraFar);
    // 将网格添加到容器
    console.log("加载ply文件");
    meshContainer.add(mesh);
    console.log("加载ply文件完成");
    document.getElementById('img_before_scene').style.display = 'none';
    document.getElementById("more_content").style.display = 'none';
    rebuild_mode_select_label.innerText = '物体生成';
    document.getElementById('two_render_window').style.left = '-820px';
    rebuild_mode = 2;
}

// 创建加载进度条
const nanobar = new Nanobar();
nanobar.el.style.background = 'gray';

// 设置加载管理器
const loadingManager = new t3d.LoadingManager(function() {
    // 加载完成回调
    nanobar.go(100);
    nanobar.el.style.background = 'transparent';
}, function(url, itemsLoaded, itemsTotal) {
    // 加载进度回调
    if (itemsLoaded < itemsTotal) {
        nanobar.go(itemsLoaded / itemsTotal * 100);
    }
});

//选择转换方式
document.getElementById('rebuild_mode_select').addEventListener('click', function() {
    if (!is_click) {
        let mode_select_list = document.getElementById('mode_select_list');
        let mode_select_img = document.getElementById('mode_select_img');
        this.style.borderColor =  "rgba(87, 87, 87, 0.8)";
        mode_select_img.src = 'img/向上.png';
        mode_select_list.style.display = 'block';
        is_click = true;
    }
    else {
        let mode_select_list = document.getElementById('mode_select_list');
        let mode_select_img = document.getElementById('mode_select_img');
        this.style.borderColor =  "rgba(83, 83, 83, 0.4)";
        mode_select_img.src = 'img/向下.png';
        mode_select_list.style.display = 'none';
        is_click = false;
    }
});

//室内场景生成模式选择
document.getElementById('mode_select_list').children[0].addEventListener('click', function() {
    let hasMesh = false;
    scene.traverse(child => {
        if (child.isPoints || child.isMesh) hasMesh = true;
    });
    if(!hasMesh){
        img_before_scene.style.display = 'block';
    }
    else{
        img_before_scene.style.display = 'none';
    }
    rebuild_mode_select_label.innerText = '室内场景生成';
    document.getElementById('two_render_window').style.left = '0px';
    rebuild_mode = 1;
});

//物体生成模式选择
document.getElementById('mode_select_list').children[1].addEventListener('click', function() {
    if(!mesh){
        console.log(img_before_scene.style.display);
        img_before_scene.style.display = 'block';
        console.log(img_before_scene.style.display);
    }
    else{
        img_before_scene.style.display = 'none';
    }
    rebuild_mode_select_label.innerText = '物体生成';
    document.getElementById('two_render_window').style.left = '-820px';
    rebuild_mode = 2;
});

//点击“导入ply模型”
document.getElementById('file-uploader-ply').addEventListener('click', function() {
    document.getElementById('file-input-ply').click();
});

// 处理ply文件上传
document.getElementById('file-input-ply').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    console.log("上传ply文件");
    if (file) {
        // 处理 PLY 文件
        if (file.name.match(/\.ply$/)) {
            try {
                // 使用await正确处理异步操作
                const buffer = await file.arrayBuffer();
                const plyLoader = new PLYLoader(loadingManager);
                const result = plyLoader.parse(buffer);
                showMesh(result);
            } catch (error) {
                console.error('PLY文件处理错误:', error);
            }
        } else {
            console.error('不支持的文件类型:', file.name);
        }
    }
});
//                                       //
//              场景生成通信              //
//                                       //
// 发送转换请求给服务端并接收ply或obj文件
document.getElementById("file-convert").addEventListener("click", async function() {
    if(rebuild_mode == 0){
        get_rebuild_mode_0();
    }
    if(rebuild_mode == 1){
        if(obj_hasbuild) {
            showUploadinfo("已重建，转换",0);
            return;
        }
        get_rebuild_mode_1();
    }
    if(rebuild_mode == 2){
        if(ply_hasbuild){
            showUploadinfo("已重建，转换",0);
            return;
        }
        get_rebuild_mode_2();
    }
});

//没有选择模式
async function get_rebuild_mode_0(){
    showUploadinfo("未选择模式，文件转换",0);
    return;
}

//选择室内场景生成模式，发送视频路径，返回obj文件
async function get_rebuild_mode_1(){
    // showUploadinfo("室内场景生成",1);
    // return;
    if (!mp4FilePath) {
        alert('未获取服务器视频文件路径');
        return;
    }
    // 显示转换进度指示器
    document.getElementById('lay_img').classList.add('loading');
    try {
        const response = await fetch('http://localhost:5000/convert_obj', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoPath: mp4FilePath })
        });
        const result = await response.json();
        if (response.ok) {
            showUploadinfo("室内场景生成",1);
            // 检查是否成功获取OBJ文件内容
            if (result.objContent) {
                // 清除旧模型
                clearScene();
                // 加载OBJ文件
                const loader = new THREE.OBJLoader();
                const object = loader.parse(result.objContent);
                // 自动缩放模型
                const bbox = new THREE.Box3().setFromObject(object);
                const center = bbox.getCenter(new THREE.Vector3());
                object.position.sub(center);
                const size = bbox.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 5 / maxDim;
                object.scale.set(scale, scale, scale);
                // 应用默认材质
                object.traverse(child => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({
                            color: 0x2194ce,
                            shininess: 100
                        });
                    }
                });
                scene.add(object);
                img_before_scene.style.display = 'none';
                more_content.style.display = 'none';
                rebuild_mode_select_label.innerText = '室内场景生成';
                document.getElementById('two_render_window').style.left = '0px';
                rebuild_mode = 1;
                obj_hasbuild = true;
                showUploadinfo("文件转换",1);
            } else {
                showUploadinfo("未获取文件，转换",0);
            }
        } else {
            showUploadinfo("室内场景转换",0);
            alert('文件转换失败: ' + result.message);
        }
    } catch (error) {
        showUploadinfo("转换过程中发生错误，",0);
        alert('转换过程中发生错误: ' + error.message);
    } finally {
        document.getElementById('lay_img').classList.remove('loading');
    }
}

//选择物体生成模式，发送视频路径，返回ply文件
async function get_rebuild_mode_2() {
    if (!mp4FilePath) {
        alert('未获取服务器视频文件路径');
        return;
    }
    // 显示转换进度指示器
    document.getElementById('lay_img').classList.add('loading');
    try {
        const response = await fetch('http://localhost:5000/convert_ply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoPath: mp4FilePath })
        });
        const result = await response.json();
        if (response.ok) {
            showUploadinfo("物体生成", 1);
            // 检查是否成功获取PLY文件内容
            if (result.plyContent) {
                // 将base64编码的PLY内容转换回二进制
                const binaryString = atob(result.plyContent);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const buffer = bytes.buffer;
                // 使用PLYLoader解析PLY文件
                const plyLoader = new PLYLoader(loadingManager);
                const parseResult = plyLoader.parse(buffer);
                // 显示网格
                showMesh(parseResult);
                console.log("加载ply文件完成");
                document.getElementById('img_before_scene').style.display = 'none';
                document.getElementById("more_content").style.display = 'none';
                rebuild_mode_select_label.innerText = '物体生成';
                document.getElementById('two_render_window').style.left = '-820px';
                rebuild_mode = 2;
                ply_hasbuild = true;
                showUploadinfo("文件转换",1);
            } else {
                showUploadinfo("未获取文件，转换", 0);
            }
        } else {
            showUploadinfo("物体生成转换", 0);
            alert('文件转换失败: ' + result.message);
        }
    } catch (error) {
        showUploadinfo("转换过程中发生错误，", 0);
        alert('转换过程中发生错误: ' + error.message);
    } finally {
        document.getElementById('lay_img').classList.remove('loading');
    }
}
//
//
//
// 创建计时器
const timer = new Timer();

// 渲染循环
function loop(timestamp) {
    requestAnimationFrame(loop);
    // 更新计时器
    timer.update(timestamp);
    // 更新控制器
    controller.update();
    viewControls.update(timer.getDelta());
    // 更新网格
    if (mesh) {
        mesh.update(ply_camera, width, height);
    }
    // 渲染场景
    forwardRenderer.render(ply_scene, ply_camera);
}
requestAnimationFrame(loop);

// 窗口大小调整处理
function onWindowResize() {
    width = 800 || 2;
    height = 600 || 2;
    // 更新相机参数
    ply_camera.setPerspective(45 / 180 * Math.PI, width / height, cameraNear, cameraFar);
    // 调整渲染目标大小
    forwardRenderer.backRenderTarget.resize(width, height);
}
window.addEventListener('resize', onWindowResize, false);
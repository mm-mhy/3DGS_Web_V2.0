// 初始化基础Three.js场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
// 设置渲染器
renderer.setSize(800, 600);
renderer.domElement.style.borderRadius = '20px';
renderer.setClearColor(0x101010);
// document.body.appendChild(renderer.domElement);
document.getElementById('render_window').appendChild(renderer.domElement);
// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);
const gridHelper = new THREE.GridHelper(20, 20,0x444444, 0x606060);
scene.add(gridHelper);
// 设置相机位置和轨道控制器
camera.position.set(20, 10, 20);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const img_before_scene = document.getElementById('img_before_scene');
const file_clear = document.getElementById('file-clear');
//视频文件选择
const CONVERTFORINDOOR = false;//.obj
const CONVERTFOROBJECT = true;//.ply
let selectChangedOption = CONVERTFOROBJECT;
let mp4FilePath = "";
let is_click = false;
let is_click2 = false;
let rebuild_mode = 0;
let rebuild_mode_select_label = document.getElementById('rebuild_mode_select_label');
document.getElementById('mp4_file_uploader').addEventListener('click', function() {
    document.getElementById('mp4_file_input').click();
});
document.getElementById('mp4_file_input').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const layImg = document.getElementById('lay_img');
    let video; // 在此处声明变量
    layImg.classList.add('loading');
    try {
        video = document.createElement('video'); // 在此处赋值
        video.src = URL.createObjectURL(file);
        video.muted = true;

        await new Promise((resolve, reject) => {
            video.onloadedmetadata = resolve;
            video.onerror = reject;
        });
        video.currentTime = 0.1;
        await new Promise(resolve => video.onseeked = resolve);
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);  
        layImg.style.backgroundImage = `url(${canvas.toDataURL()})`;
    } catch (error) {
        layImg.style.backgroundImage = 'url(img/image_1.png)';
        alert('视频处理失败: ' + error.message);
    } finally {
        layImg.classList.remove('loading');
        if (video && video.src) { // 安全访问
            URL.revokeObjectURL(video.src);
        }
    }
});
//视频文件上传，发送文件到服务端
document.getElementById("file-deliver").addEventListener("click", async function() {
    post_MP4_file();
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
document.getElementById('mode_select_list').children[0].addEventListener('click', function() {
    rebuild_mode_select_label.innerText = '室内场景生成';
    rebuild_mode = 1;
});
document.getElementById('mode_select_list').children[1].addEventListener('click', function() {
    rebuild_mode_select_label.innerText = '物体生成';
    rebuild_mode = 2;
});
// 发送转换请求给服务端并接收ply或obj文件
document.getElementById("file-convert").addEventListener("click", async function() {
    if(rebuild_mode == 0){
        get_rebuild_mode_0();
    }
    if(rebuild_mode == 1){
        get_rebuild_mode_1();
    }
    if(rebuild_mode == 2){
        get_rebuild_mode_2();
    }
});
//导入obj和导入ply
document.getElementById('more').addEventListener('click',function(){
    if(!is_click2){
        let more_content = document.getElementById('more_content');
        more_content.style.display = 'block';
        is_click2 = true;
    }
    else{
        let more_content = document.getElementById('more_content');
        more_content.style.display = 'none';
        is_click2 = false;
    }
});
//OBJ文件本地展示
document.getElementById('file-uploader').addEventListener('click', function() {
    document.getElementById('file-input').click();
});
// 处理文件上传
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    // 清除旧模型
    clearScene();
    // 加载OBJ文件
    const loader = new THREE.OBJLoader();
    const reader = new FileReader();
    reader.onload = function(event) {
        const objData = event.target.result;
        try {
            const object = loader.parse(objData);
            // 自动缩放模型
            const bbox = new THREE.Box3().setFromObject(object);
            const center = bbox.getCenter(new THREE.Vector3());
            const size = bbox.getSize(new THREE.Vector3());          
            // 调整位置和比例
            object.position.sub(center);
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
            file_clear.style.display = 'block';
            more_content.style.display = 'none';
        } catch (error) {
            console.error('Error loading OBJ:', error);
            alert('无法加载OBJ文件，请检查文件格式');
        }
    };
    reader.readAsText(file);
});
//PLY文件本地展示
document.getElementById('file-uploader-ply').addEventListener('click', function() {
    document.getElementById('file-input-ply').click();
})
// 处理文件上传
document.getElementById('file-input-ply').addEventListener('change', function(e) {
    const img_before_scene = document.getElementById('img_before_scene');
    img_before_scene.classList.add('loading');
    const more_content = document.getElementById('more_content');
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        const contents = event.target.result;
        const loader = new THREE.PLYLoader();

        const geometry = loader.parse(contents);
        if (geometry.attributes.color) {
            console.log("has color");
            // 假设颜色数据以浮点数形式存储在[0, 1]范围内
            const colors = geometry.attributes.color.array;
            for (let i = 0; i < colors.length; i += 3) {
                // 可能需要将颜色数据从 [0, 1] 范围转换为 [0, 255] 范围
                colors[i] *= 255;
                colors[i + 1] *= 255;
                colors[i + 2] *= 255;
            }
        }

        let material;
        if (geometry.attributes.color) {
            material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
        } else {
            material = new THREE.PointsMaterial({ size: 0.01, color: 0xbbbbbb });
        }
        const mesh = new THREE.Points(geometry, material);

        geometry.computeBoundingBox();
        if (geometry.boundingBox) {
            const center = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            mesh.position.sub(center);
        }
        scene.add(mesh);
        img_before_scene.style.display = 'none';
        file_clear.style.display = 'block';
        more_content.style.display = 'none';
        img_before_scene.classList.remove('loading');
    };
    reader.readAsArrayBuffer(file);
    console.log(scene.children.length)
})
//清空场景内容
function clearScene(){
    // 清除所有网格和材质
    scene.traverse(child => {
        if (child.isPoints || child.isMesh) {
            child.geometry.dispose(); // 释放几何体
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose()); // 处理材质数组
                } else {
                    child.material.dispose(); // 释放单一材质
                }
            }
            scene.remove(child); // 从场景移除
        }
    });

    // 强制清理残留的组或空对象
    scene.children = scene.children.filter(child => !child.isMesh && !child.isGroup);
}
//处理清空场景内容
document.getElementById('file-clear').addEventListener('click', function() {
    let hasMesh = false;
    scene.traverse(child => {
        if (child.isPoints || child.isMesh) hasMesh = true;
    });
    if (!hasMesh) {
        alert('当前场景没有模型');
        return;
    }
    clearScene();
    img_before_scene.style.display = 'block';
})
// 窗口大小调整处理
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
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
let mp4FilePath = "";
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
    const mp4FileInput = document.getElementById('mp4_file_input');
    const file = mp4FileInput.files[0];
    const filename = mp4FileInput.files[0].name.split('.')[0];
    if (!file) {
        alert('请先选择视频文件');
        return;
    }
    document.getElementById("lay_img").classList.add('loading');
    const formData = new FormData();
    formData.append('file', file);
    try{
        const response = await fetch('http://localhost:5000/upload',{
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if(response.ok){
            alert('上传成功');
            //返回服务器的文件路径
            mp4FilePath = result.file_path;
        }else{
            alert('上传失败');
        }
    }catch(error){
        alert('上传失败');
    }finally{
        document.getElementById("lay_img").classList.remove('loading');
    }
});

// 发送转换请求给服务端并接收ply或obj文件
document.getElementById("file-convert").addEventListener("click", async function() {
    if (!mp4FilePath) {
        alert('未获取服务器视频文件路径');
        return;
    }
    // 显示转换进度指示器
    document.getElementById('lay_img').classList.add('loading');
    try {
        const response = await fetch('http://localhost:5000/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoPath: mp4FilePath })
        });
        const result = await response.json();
        if (response.ok) {
            alert('文件转换成功');
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
                file_clear.style.display = 'block';
            } else {
                alert('未获取到OBJ文件内容');
            }
        } else {
            alert('文件转换失败: ' + result.message);
        }
    } catch (error) {
        alert('转换过程中发生错误: ' + error.message);
    } finally {
        document.getElementById('lay_img').classList.remove('loading');
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
        } catch (error) {
            console.error('Error loading OBJ:', error);
            alert('无法加载OBJ文件，请检查文件格式');
        }
    };
    reader.readAsText(file);
});
//清空场景内容
function clearScene(){
    // 清除所有网格和材质
    scene.traverse(child => {
        if (child.isMesh) {
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
        if (child.isMesh) hasMesh = true;
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
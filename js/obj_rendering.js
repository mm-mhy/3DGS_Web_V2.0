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
// 设置相机位置和轨道控制器
camera.position.set(20, 10, 20);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const img_before_scene = document.getElementById('img_before_scene');

//相关常量、变量声明
const CONVERTFORINDOOR = false;//.obj
const CONVERTFOROBJECT = true;//.ply
let selectChangedOption = CONVERTFOROBJECT;
let mp4FilePath = "";
let is_click = false;
let is_click2 = false;
let rebuild_mode = 0;
let rebuild_mode_select_label = document.getElementById('rebuild_mode_select_label');
let obj_hasbuild = false;
let ply_hasbuild = false;
//上传文件
document.getElementById('mp4_file_uploader').addEventListener('click', function() {
    document.getElementById('mp4_file_input').click();
});

//选择mp4文件并处理
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
    rebuild_mode = 1;
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
            more_content.style.display = 'none';
            rebuild_mode_select_label.innerText = '室内场景生成';
            document.getElementById('two_render_window').style.left = '0px';
            rebuild_mode = 1;
        } catch (error) {
            console.error('Error loading OBJ:', error);
            alert('无法加载OBJ文件，请检查文件格式');
        }
    };
    reader.readAsText(file);
});

//清空场景内容
function clearScene(){
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
    scene.children = scene.children.filter(child => !child.isMesh && !child.isGroup);
}

//文件上传成功弹窗
function showUploadinfo(operation,status){
    const reminder = document.createElement('div');
    document.body.appendChild(reminder);
    reminder.classList.add('reminder');
    const img = document.createElement('img');
    img.style.height = '100%'
    reminder.appendChild(img);
    const reminder_text = document.createElement('span');
    reminder_text.classList.add('reminder_text');
    reminder.appendChild(reminder_text);
    if(status == 1){
        img.src = 'img/Success.png';
        reminder_text.innerText = operation + '成功';
        reminder.style.borderColor = 'green';
        reminder_text.style.color = 'green';
        console.log("状态："+ operation + "成功");
    }
    else{
        img.src = 'img/Error.png';
        reminder_text.innerText = operation + '失败';
        reminder.style.borderColor = 'red';
        reminder_text.style.color = 'red';
        console.log("状态："+ operation + "失败");
    }
    setTimeout(() => {
        document.body.removeChild(reminder);
    },1000);

}

// 窗口大小调整处理
window.addEventListener('resize', () => {
    camera.aspect = 800 / 600;
    camera.updateProjectionMatrix();
    renderer.setSize(800, 600);
});

// 简化版视图控制器
function createViewControls() {
    // 创建画布元素
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    canvas.style.position = 'absolute';
    canvas.style.bottom = '0px';
    canvas.style.left = '0px';
    canvas.style.zIndex = '99';
    canvas.style.userSelect = 'none';
    const context = canvas.getContext('2d', { alpha: true });
    // 轴向定义
    const axes = [
        { name: 'x', color: '#ff3653', direction: new THREE.Vector3(1, 0, 0) },
        { name: '-x', color: '#ff3653', direction: new THREE.Vector3(-1, 0, 0) },
        { name: 'y', color: '#8adb00', direction: new THREE.Vector3(0, 1, 0) },
        { name: '-y', color: '#8adb00', direction: new THREE.Vector3(0, -1, 0) },
        { name: 'z', color: '#2c8fff', direction: new THREE.Vector3(0, 0, 1) },
        { name: '-z', color: '#2c8fff', direction: new THREE.Vector3(0, 0, -1) }
    ];
    // 视图点
    const points = axes.map(() => ({
        axisIndex: 0,
        position: new THREE.Vector3(),
        linePosition: new THREE.Vector3()
    }));
    // 最后一次渲染的四元数，用于检测相机是否移动
    const lastQuaternion = new THREE.Quaternion();
    // 平滑过渡的目标相机位置
    const targetCameraPosition = new THREE.Vector3();
    const currentCameraPosition = new THREE.Vector3();
    let isTransitioning = false;
    let transitionProgress = 0;
    const transitionSpeed = 0.5; // 过渡速度因子
    // 事件处理
    function onPointerUp(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // 检测点击了哪个控制点
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const dx = point.position.x - x;
            const dy = point.position.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 10) { // 点击半径
                const axisIndex = point.axisIndex;
                // 根据点击的轴设置相机目标位置
                targetCameraPosition.copy(camera.position);
                switch(axisIndex) {
                    case 0: // x
                        targetCameraPosition.set(20, 0, 0);
                        break;
                    case 1: // -x
                        targetCameraPosition.set(-20, 0, 0);
                        break;
                    case 2: // y
                        targetCameraPosition.set(0, 20, 0);
                        break;
                    case 3: // -y
                        targetCameraPosition.set(0, -20, 0);
                        break;
                    case 4: // z
                        targetCameraPosition.set(0, 0, 20);
                        break;
                    case 5: // -z
                        targetCameraPosition.set(0, 0, -20);
                        break;
                }
                currentCameraPosition.copy(camera.position);
                isTransitioning = true;
                transitionProgress = 0;
                break;
            }
        }
    }
    canvas.addEventListener('pointerup', onPointerUp);
    // 缓动函数 - 平滑过渡
    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }
    // 处理相机平滑过渡
    function updateCameraTransition() {
        if (!isTransitioning) return false;
        transitionProgress += transitionSpeed;
        if (transitionProgress >= 1) {
            // 过渡完成
            camera.position.copy(targetCameraPosition);
            isTransitioning = false;
        } else {
            // 使用缓动函数使过渡更平滑
            const easedProgress = easeOutCubic(transitionProgress);
            // 平滑插值
            camera.position.copy(currentCameraPosition).lerp(targetCameraPosition, easedProgress);
        }
        camera.lookAt(0, 0, 0);
        controls.update();
        return true;
    }
    // 更新控制器
    function update() {
        // 处理相机过渡动画
        const transitionOccurred = updateCameraTransition();
        // 检测相机是否变化或处于过渡状态
        if (lastQuaternion.dot(camera.quaternion) < 0.999 || transitionOccurred) {
            lastQuaternion.copy(camera.quaternion);
            const center = new THREE.Vector3(50, 50, 0);
            const distance = 40; // 到中心的距离
            const lineDistance = 20; // 线条长度
            // 定义固定的相对位置（在三维空间中）
            const fixedPositions = [
                new THREE.Vector3(1, 0, 0).multiplyScalar(distance),    // x
                new THREE.Vector3(-1, 0, 0).multiplyScalar(distance),   // -x
                new THREE.Vector3(0, 1, 0).multiplyScalar(distance),    // y
                new THREE.Vector3(0, -1, 0).multiplyScalar(distance),   // -y
                new THREE.Vector3(0, 0, 1).multiplyScalar(distance),    // z
                new THREE.Vector3(0, 0, -1).multiplyScalar(distance)    // -z
            ];
            const fixedLinePositions = [
                new THREE.Vector3(1, 0, 0).multiplyScalar(lineDistance),    // x
                new THREE.Vector3(-1, 0, 0).multiplyScalar(lineDistance),   // -x
                new THREE.Vector3(0, 1, 0).multiplyScalar(lineDistance),    // y
                new THREE.Vector3(0, -1, 0).multiplyScalar(lineDistance),   // -y
                new THREE.Vector3(0, 0, 1).multiplyScalar(lineDistance),    // z
                new THREE.Vector3(0, 0, -1).multiplyScalar(lineDistance)    // -z
            ];
            // 计算所有轴的位置
            for (let i = 0; i < axes.length; i++) {
                const point = points[i];
                point.axisIndex = i;
                // 应用相机旋转的反向变换到轴向量上
                const rotatedPos = fixedPositions[i].clone()
                    .applyQuaternion(camera.quaternion.clone().conjugate());
                const rotatedLinePos = fixedLinePositions[i].clone()
                    .applyQuaternion(camera.quaternion.clone().conjugate());
                // 计算点的位置（屏幕坐标）
                point.position.copy(rotatedPos).add(center);
                point.position.y = 100 - point.position.y; // 翻转Y轴以匹配屏幕坐标
                // 计算线条的端点位置
                point.linePosition.copy(rotatedLinePos).add(center);
                point.linePosition.y = 100 - point.linePosition.y;
            }
            // 根据Z轴排序点，确保正确的绘制顺序
            const pointsWithDepth = points.map((point, index) => ({
                point,
                depth: fixedPositions[point.axisIndex].clone()
                    .applyQuaternion(camera.quaternion.clone().conjugate()).z,
                index
            }));
            // 按深度排序
            pointsWithDepth.sort((a, b) => a.depth - b.depth);
            // 清空画布
            context.clearRect(0, 0, 100, 100);
            // 绘制后面的点（z值小的）
            const halfLength = Math.floor(pointsWithDepth.length / 2);
            for (let i = 0; i < halfLength; i++) {
                const { point, index } = pointsWithDepth[i];
                const axis = axes[point.axisIndex];
                drawPoint(context, point, axis);
            }
            // 绘制所有线条
            for (let i = 0; i < pointsWithDepth.length; i++) {
                const { point, index } = pointsWithDepth[i];
                const axis = axes[point.axisIndex];
                drawLine(context, center, point, axis);
            }
            // 绘制前面的点（z值大的）
            for (let i = halfLength; i < pointsWithDepth.length; i++) {
                const { point, index } = pointsWithDepth[i];
                const axis = axes[point.axisIndex];
                drawPoint(context, point, axis);
            }
        }
    }
    
// 绘制控制点
function drawPoint(context, point, axis) {
        context.fillStyle = axis.color;
        context.beginPath();
        context.arc(point.position.x, point.position.y, 10, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#ffffff';
        context.font = 'bold 12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(axis.name, point.position.x, point.position.y);
}

// 绘制线条
function drawLine(context, center, point, axis) {
        context.strokeStyle = axis.color;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(center.x, center.y);
        context.lineTo(point.linePosition.x, point.linePosition.y);
        context.stroke();
}
    
    // 添加到DOM
document.getElementById('render_window').appendChild(canvas);
    // 返回更新函数和销毁函数
    return {
        update: update,
        dispose: function() {
            canvas.removeEventListener('pointerup', onPointerUp);
            document.getElementById('render_window').removeChild(canvas);
        }
    };
}

// 创建视图控制器并获取更新函数
const viewControls = createViewControls();

// 修改动画循环函数
const originalAnimate = animate;
animate = function() {
    requestAnimationFrame(animate);
    controls.update();
    // 更新视图控制器
    viewControls.update();
    renderer.render(scene, camera);
};

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
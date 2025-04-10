//没有选择模式
async function get_rebuild_mode_0(){
    alert('请选择转换方式');
    return;
}
//选择室内场景生成模式
async function get_rebuild_mode_1(){
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
}
//选择物体生成模式
async function get_rebuild_mode_2(){
    alert('物体生成方式');
    return;
}
//文件上传
async function post_MP4_file() {
    const mp4FileInput = document.getElementById('mp4_file_input');
    const file = mp4FileInput.files[0];
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
}
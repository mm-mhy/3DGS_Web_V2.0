//文件上传，发送视频，返回视频路径
async function post_MP4_file() {
    // alert('上传视频');
    // mp4FilePath = "C:/77777";
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
            showUploadinfo("视频文件上传",1);
            //返回服务器的文件路径
            mp4FilePath = result.file_path;
            obj_hasbuild = false;
            ply_hasbuild = false;
        }else{
            alert('上传失败');
        }
    }catch(error){
        alert('上传失败');
    }finally{
        document.getElementById("lay_img").classList.remove('loading');
    }    
}
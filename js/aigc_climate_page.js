//选择图片
var imgFilePath = "";
document.getElementById('aigc_img_uploader').addEventListener('click', function() {
    document.getElementById('aigc_img_input').click();
});
document.getElementById('aigc_img_input').addEventListener('change', function(event) {
    var file = event.target.files[0];
    var img = document.getElementById('img-before');
    var img_before_box = document.getElementById('img_before_box');
    if (!file) {
        return;
    }
    img.src = URL.createObjectURL(file);
    showUploadImg(true);
    img_before_box.style.display = 'none';
})
//显示选择的图片
function showUploadImg(isUpload){
    var slider = document.getElementById('slider');
    if (isUpload){
        slider.value = 100;
    }
    else{
        slider.value = 0;
    }

    var imgBefore = document.getElementById('img-before');
    var spliter_box = document.getElementById('spliter_box');
    imgBefore.style.clipPath = 'inset(0 ' + (100 - slider.value) + '% 0 0)';
    spliter_box.style.left = slider.value - 4 + '%';
}
//滑动条
document.addEventListener("DOMContentLoaded", function() {
    var slider = document.getElementById('slider');
    var imgBefore = document.getElementById('img-before');
    var spliter_box = document.getElementById('spliter_box');

    function updateClipPath(value) {
        imgBefore.style.clipPath = 'inset(0 ' + (100 - value) + '% 0 0)';
        spliter_box.style.left = value - 4 + '%';
    }

    updateClipPath(slider.value);

    slider.addEventListener('input', function(e) {
        updateClipPath(e.target.value);
    });
});
//图片上传请求
document.getElementById('aigc_img_deliver').addEventListener('click', function() {
    var img = document.getElementById('aigc_img_input');
    const imgFile = img.files[0];
    if (!imgFile) {
        alert('请先选择图片文件');
        return;
    }
    //发送图片，获得图片路径
    //测试
    alert('上传图片成功');
    imgFilePath = "img/scene_test_01_tosnow.png";
})
//图片生成请求
document.getElementById('aigc_img_convert').addEventListener('click', function() {
    if (!imgFilePath) {
        alert('未获取服务器图片文件路径');
        return;
    }
    var img = document.getElementById('img-after');
    var clearButton = document.getElementById('aigc_img_clear');
    var slider = document.getElementById('slider');
    var spliter_box = document.getElementById('spliter_box');
    //接口：输入图片路径，输出转换后的图片路径，img.src加载转换后的图片
    alert('图片生成成功');
    img.src = "img/scene_test_01_tosnow.png"
    showUploadImg(false);
    slider.style.display = 'block';
    clearButton.style.display = 'block';
    spliter_box.style.display = 'block';

})
//图片内容清除
document.getElementById('aigc_img_clear').addEventListener('click', function() {
    if (!imgFilePath) {
        alert('未生成图片');
        return;
    }
    var img = document.getElementById('img-after');
    var slider = document.getElementById('slider');
    var spliter_box = document.getElementById('spliter_box');
    img.src = "";
    slider.style.display = 'none';
    spliter_box.style.display = 'none';
    showUploadImg(true);
    imgFilePath = "";
})
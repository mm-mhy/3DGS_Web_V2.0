document.addEventListener('DOMContentLoaded', function () {
    var labels = document.querySelectorAll('.nav_label');
    var page = document.getElementById('page');
    labels[0].addEventListener('click', function() { // 3D内容智能生成
        page.style.left = '0px';
    });

    labels[1].addEventListener('click', function() { // AIGC气象智能生成
        page.style.left = '-1420px';
    });
});
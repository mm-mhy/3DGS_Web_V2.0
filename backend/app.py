from flask import Flask, request, jsonify
import os
import time
from werkzeug.utils import secure_filename
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)  # 启用CORS以允许前端跨域请求

# 确保上传目录存在
UPLOAD_FOLDER = 'upload_video'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 指定模型文件路径
OBJ_MODEL_PATH = os.path.join('sources', 'model_normalized.obj')
PLY_MODEL_PATH = os.path.join('sources', 'goldbudy.ply')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 限制上传文件大小为500MB

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': '没有文件部分'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if file:
        # 安全地获取文件名
        filename = secure_filename(file.filename)
        # 处理文件名（移除.mp4后缀）
        if filename.lower().endswith('.mp4'):
            base_name = filename[:-4]
        else:
            base_name = filename
        
        # 添加时间戳生成新文件名
        timestamp = int(time.time())
        new_filename = f"{base_name}{timestamp}.mp4"
        
        # 保存文件
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        file.save(file_path)
        
        # 返回文件路径
        return jsonify({'file_path': file_path})
    
    return jsonify({'error': '文件上传失败'}), 500

@app.route('/convert_obj', methods=['POST'])
def convert_obj():
    # 获取请求数据
    data = request.json
    video_path = data.get('videoPath')
    
    # 检查视频文件是否存在
    if not video_path or not os.path.exists(video_path):
        return jsonify({'message': '视频文件不存在或路径无效'}), 404
    
    try:
        # 检查OBJ模型文件是否存在
        if not os.path.exists(OBJ_MODEL_PATH):
            return jsonify({'message': 'OBJ模型文件不存在'}), 404
        
        # 读取OBJ文件内容并返回给前端
        with open(OBJ_MODEL_PATH, 'r') as f:
            obj_content = f.read()
        
        return jsonify({
            'message': '转换成功',
            'objContent': obj_content
        })
    
    except Exception as e:
        return jsonify({'message': f'转换过程中发生错误: {str(e)}'}), 500

@app.route('/convert_ply', methods=['POST'])
def convert_ply():
    # 获取请求数据
    data = request.json
    video_path = data.get('videoPath')
    
    # 检查视频文件是否存在
    if not video_path or not os.path.exists(video_path):
        return jsonify({'message': '视频文件不存在或路径无效'}), 404
    
    try:
        # 检查PLY模型文件是否存在
        if not os.path.exists(PLY_MODEL_PATH):
            return jsonify({'message': 'PLY模型文件不存在'}), 404
        
        # 读取PLY文件内容（二进制模式）
        with open(PLY_MODEL_PATH, 'rb') as f:
            ply_content = f.read()
        
        # 将二进制内容转换为base64编码的字符串
        ply_base64 = base64.b64encode(ply_content).decode('utf-8')
        
        return jsonify({
            'message': '转换成功',
            'plyContent': ply_base64
        })
    
    except Exception as e:
        return jsonify({'message': f'转换过程中发生错误: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
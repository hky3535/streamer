import os
import flask
import subprocess
import signal


class Streamer:
    def __init__(self):
        self.ip = "0.0.0.0"
        self.port = 60000
        self.storage = "/streamer/streamer/storage" # 视频存储目录
        self.statuses = {name: False for name in sorted(os.listdir(self.storage), key=lambda x: x.lower())} # 广播状态字典 {"name": False/pid}

    def broadcast(self, name):
        command = ["ffmpeg", 
            "-re", 
            "-stream_loop", "-1", 
            "-i", f"{self.storage}/{name}", 
            "-rtsp_transport", "tcp", 
            "-vcodec", "copy", 
            "-acodec", "copy", 
            "-f", "rtsp", 
            f"rtsp://0.0.0.0:8554/{name}" 
        ]
        process = subprocess.Popen(command)
        pid = process.pid
        return pid

    def run(self):
        app = flask.Flask(__name__)

        @app.route("/", methods=["GET"]) # GET 根目录
        def index():
            return flask.render_template("index.html")

        @app.route("/items", methods=["GET"]) # GET 获取项目列表
        def items():
            items_dict = self.statuses.copy()
            return flask.jsonify(items_dict)

        @app.route("/upload", methods=["POST"]) # POST 上传一个项目
        def upload():
            file = flask.request.files["file"]
            name = file.filename
            file.save(f"{self.storage}/{name}")
            self.statuses[name] = False
            return flask.jsonify({})

        @app.route("/delete", methods=["GET"]) # GET 删除一个项目
        def delete():
            name = flask.request.args.get("name")
            if name in self.statuses:
                del self.statuses[name]
            if os.path.exists(f"{self.storage}/{name}"):
                os.remove(f"{self.storage}/{name}")
            return flask.jsonify({})

        @app.route("/play", methods=["GET"]) # POST 播放一个项目
        def play():
            name = flask.request.args.get("name")
            if self.statuses[name] is False:
                self.statuses[name] = self.broadcast(name) # 广播状态
            return flask.jsonify({})

        @app.route("/stop", methods=["GET"]) # POST 停止一个项目
        def stop():
            name = flask.request.args.get("name")
            if self.statuses[name] is not False:
                os.kill(self.statuses[name], signal.SIGTERM) # 广播状态
                self.statuses[name] = False
            return flask.jsonify({})

        app.run(host=self.ip, port=self.port, debug=False)


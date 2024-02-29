from streamer import Streamer
import subprocess

def run():
    subprocess.Popen(["/streamer/mediamtx/mediamtx", "/streamer/mediamtx/mediamtx.yml"]) # 启动rtsp服务器
    streamer = Streamer()
    streamer.run()

if __name__ == "__main__":
    run()

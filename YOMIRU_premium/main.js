var audioContext
var recorder
 
// 初期化
window.onload = function init() {
  // オーディオコンテキストの初期化
  audioContext = new (window.AudioContext || window.webkitAudioContext)()

  // 音声入力の取得
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
      // レコーダーの生成
      var input = audioContext.createMediaStreamSource(stream)
      audioContext.resume()
      recorder = new Recorder(input) 
    })
  }
}

// 録音開始
function startRecording(button) {
  recorder && recorder.record()
}

// 録音停止
function stopRecording(button) {
  recorder && recorder.stop()
   
  // 音声認識
  audioRecognize()
   
  // レコーダーのクリア
  recorder.clear()
}

// 音声認識
function audioRecognize() {
  // WAVのエクスポート
  recorder && recorder.exportWAV(function(blob) {
    let reader = new FileReader()
    reader.onload = function() {
      // 音声認識
      let result = new Uint8Array(reader.result)
      let data = {
        "config": {
          "encoding": "LINEAR16",
          "languageCode": "en-US",
          "audio_channel_count": 2
        },
        "audio": {
          "content": arrayBufferToBase64(result)
        }
      }
      fetch('https://speech.googleapis.com/v1/speech:recognize?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
      }).then(function (response) {
        return response.text()
      }).then(function (text) {
        let result_json = JSON.parse(text)
        // 音声認識結果の表示
        text = result_json.results[0].alternatives[0].transcript
        output.innerHTML += "\n" + text
        console.log("result: " + text)
      })
    }
    reader.readAsArrayBuffer(blob)
  })
}

// ArrayBuffer → Base64
function arrayBufferToBase64(buffer) {
  let binary = ''
  let bytes = new Float32Array(buffer)
  let len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

// オーディオタグの追加
function addAudioTag() {
    // WAVのエクスポート
    recorder && recorder.exportWAV(function(blob) {
      // オーディオタグの追加
      var url = URL.createObjectURL(blob)
      var au = document.createElement('audio')
      au.controls = true
      au.src = url
      output.appendChild(au)
      var br = document.createElement('br')
      output.appendChild(br)
    })
  }
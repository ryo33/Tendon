const http = require('http')
const io = require('socket.io')
const speech = require('@google-cloud/speech')

const PORT = process.env.PORT || 8080

const server = http.createServer()

const gws = io(server, {
  path: '/google-cloud-speech-to-text'
})

const speechContexts = [{
  phrases: [['Arch'], ['Echo'], ['Word']]
}]

gws.on('connection', function (socket) {
  console.log('a user connected')

  const client = new speech.SpeechClient()

  let recognizeStream = null
  socket.emit('require sample rate')

  socket.on('disconnect', function () {
    console.log('user disconnected')
  })

  socket.on('sample-rate', function (rate) {
    console.log(rate)

    const request = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: rate,
        languageCode: 'en-US',
        speechContexts
      }
    }

    recognizeStream = client
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', data =>
        console.log(data.results[0].alternatives)
      )

    socket.on('disconnect', function () {
      recognizeStream.end()
    })
  })

  socket.on('audio-chunk', function (chunk) {
    if (recognizeStream) {
      recognizeStream.write(chunk)
    }
  })
})

server.listen(PORT)

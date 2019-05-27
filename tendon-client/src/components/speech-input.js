import io from 'socket.io-client'
import convert from 'pcm-convert'

import React, { useEffect } from 'react'

const SPEECH_SOCKET_URL = process.env.SPEECH_SOCKET_URL ||
  'http://localhost:8080'
const SPEECH_SOCKET_PATH = process.env.SPEECH_SOCKET_PATH ||
  '/google-cloud-speech-to-text'

const SpeechInput = () => {
  useEffect(() => {
    const socket = io(SPEECH_SOCKET_URL, {
      path: SPEECH_SOCKET_PATH
    })

    let close

    const start = async () => {
      const constrain = {
        audio: true,
        video: false
      }
      const stream = await navigator.mediaDevices.getUserMedia(constrain)
      const context = new window.AudioContext()
      const source = context.createMediaStreamSource(stream)
      const processor = context.createScriptProcessor(1024, 1, 1)

      socket.on('require sample rate', () => {
        socket.emit('sample-rate', context.sampleRate)
      })

      source.connect(processor)
      processor.connect(context.destination)

      processor.onaudioprocess = function (e) {
        const buffer = e.inputBuffer.getChannelData(0)
        const chunk = convert(buffer, 'float32', 'int16')
        socket.emit('audio-chunk', chunk.buffer)
      }

      close = () => {
        stream.getTracks().map(track => track.stop())
        context.close()
        source.disconnect(processor)
        processor.disconnect(context.destination)
      }
    }

    const promise = start()

    return () => {
      (async () => {
        await promise
        close()
      })()
      socket.close()
    }
  })

  return (
    <p>Speech Input</p>
  )
}

export default SpeechInput

import { useRef } from "react"
import { useWavesurfer } from "@wavesurfer/react"

import { PreviewProps } from "../ItemPreview"

import "./Sound.scss"

const formatTime = (seconds: number) => [seconds / 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':')

function Sound(props: PreviewProps) {
  const { item } = props

  const containerRef = useRef<HTMLDivElement>(null)

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    width: "min(90vw, 600px)",
    height: 100,
    waveColor: "#862994",
    url: `/cdn/${item.id}`,
    barRadius: 30,
    barWidth: 5,
    barGap: 4,
    dragToSeek: true
  })

  const onPlayPause = () => {
    wavesurfer?.playPause()
  }

  return (
    <div className="pre-sound">
      <div ref={containerRef}></div>
      <div className="pre-sound__time">
        <span>{formatTime(currentTime)}</span><span> / {formatTime(wavesurfer?.getDuration() ?? 0)}</span>
      </div>
      <div>
        <button onClick={onPlayPause}>
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M320-200v-560l440 280-440 280Z" /></svg>
          )}
        </button>
        {/* TODO: add volume control */}
      </div>
    </div>
  )
}

export default Sound

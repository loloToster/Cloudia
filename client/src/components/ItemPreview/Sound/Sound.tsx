import { useRef } from "react";
import { useWavesurfer } from "@wavesurfer/react";

import { PreviewProps } from "../ItemPreview";

import "./Sound.scss";

const formatTime = (seconds: number) =>
  [seconds / 60, seconds % 60]
    .map((v) => `0${Math.floor(v)}`.slice(-2))
    .join(":");

function Sound(props: PreviewProps) {
  const { item } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    width: "min(90vw, 600px)",
    height: 100,
    waveColor: "#862994",
    url: `/cdn/${item.id}`,
    barRadius: 30,
    barWidth: 5,
    barGap: 4,
    dragToSeek: true,
  });

  const onPlayPause = () => {
    wavesurfer?.playPause();
  };

  return (
    <div className="pre-sound">
      <div ref={containerRef}></div>
      <div className="pre-sound__time">
        <span>{formatTime(currentTime)}</span>
        <span> / {formatTime(wavesurfer?.getDuration() ?? 0)}</span>
      </div>
      <div>
        <button onClick={onPlayPause}>
          {isPlaying ? (
            <span className="material-symbols-rounded">pause</span>
          ) : (
            <span className="material-symbols-rounded">play_arrow</span>
          )}
        </button>
        {/* TODO: add volume control */}
      </div>
    </div>
  );
}

export default Sound;

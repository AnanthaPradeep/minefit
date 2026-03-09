import { useSyncExternalStore } from "react";

interface AmbientTrack {
  id: string;
  name: string;
  url: string;
}

interface AmbientMusicState {
  tracks: AmbientTrack[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  status: string;
}

const initialState: AmbientMusicState = {
  tracks: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  status: "Load music to start playback.",
};

class AmbientMusicPlayer {
  private state: AmbientMusicState = initialState;
  private listeners = new Set<() => void>();
  private audio: HTMLAudioElement | null = null;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = () => this.state;

  private setState(partial: Partial<AmbientMusicState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener());
  }

  private ensureAudio() {
    if (this.audio) return;

    this.audio = new Audio();
    this.audio.loop = false;
    this.audio.volume = this.state.volume;

    this.audio.addEventListener("timeupdate", () => {
      this.setState({ currentTime: this.audio?.currentTime ?? 0 });
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.setState({ duration: this.audio?.duration ?? 0 });
    });

    this.audio.addEventListener("play", () => {
      this.setState({ isPlaying: true, status: "Playing" });
    });

    this.audio.addEventListener("pause", () => {
      this.setState({ isPlaying: false, status: "Paused" });
    });

    this.audio.addEventListener("ended", () => {
      this.next();
    });
  }

  private loadTrack(index: number, autoPlay = false) {
    if (index < 0 || index >= this.state.tracks.length) return;
    this.ensureAudio();

    if (!this.audio) return;

    const track = this.state.tracks[index];
    this.audio.src = track.url;
    this.audio.currentTime = 0;
    this.setState({ currentIndex: index, currentTime: 0, duration: 0, status: `Loaded ${track.name}` });

    if (!autoPlay) return;

    this.audio.play().catch(() => {
      this.setState({ isPlaying: false, status: "Press Play to start audio." });
    });
  }

  loadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newTracks = fileArray.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    const mergedTracks = [...this.state.tracks, ...newTracks];
    const shouldAutoSelect = this.state.currentIndex === -1;

    this.setState({
      tracks: mergedTracks,
      status: `${newTracks.length} track${newTracks.length > 1 ? "s" : ""} added.`,
    });

    if (shouldAutoSelect) {
      this.loadTrack(0, false);
    }
  }

  togglePlay() {
    this.ensureAudio();
    if (!this.audio) return;

    if (this.state.currentIndex === -1 && this.state.tracks.length > 0) {
      this.loadTrack(0, true);
      return;
    }

    if (this.state.currentIndex === -1) {
      this.setState({ status: "Load music first." });
      return;
    }

    if (this.audio.paused) {
      this.audio.play().catch(() => {
        this.setState({ isPlaying: false, status: "Playback blocked. Click play again." });
      });
      return;
    }

    this.audio.pause();
  }

  next() {
    if (this.state.tracks.length === 0) return;
    const nextIndex = (this.state.currentIndex + 1 + this.state.tracks.length) % this.state.tracks.length;
    this.loadTrack(nextIndex, true);
  }

  previous() {
    if (this.state.tracks.length === 0) return;
    const previousIndex = (this.state.currentIndex - 1 + this.state.tracks.length) % this.state.tracks.length;
    this.loadTrack(previousIndex, true);
  }

  seek(percent: number) {
    if (!this.audio) return;
    const boundedPercent = Math.max(0, Math.min(100, percent));
    const nextTime = (this.state.duration * boundedPercent) / 100;
    this.audio.currentTime = Number.isFinite(nextTime) ? nextTime : 0;
    this.setState({ currentTime: this.audio.currentTime });
  }

  setVolume(volume: number) {
    const boundedVolume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = boundedVolume;
    }
    this.setState({ volume: boundedVolume });
  }

  getCurrentTrack() {
    if (this.state.currentIndex < 0) return null;
    return this.state.tracks[this.state.currentIndex] ?? null;
  }
}

const ambientMusicPlayer = new AmbientMusicPlayer();

export function useAmbientMusicPlayer() {
  const state = useSyncExternalStore(ambientMusicPlayer.subscribe, ambientMusicPlayer.getState, ambientMusicPlayer.getState);

  return {
    state,
    currentTrack: ambientMusicPlayer.getCurrentTrack(),
    actions: {
      loadFiles: ambientMusicPlayer.loadFiles.bind(ambientMusicPlayer),
      togglePlay: ambientMusicPlayer.togglePlay.bind(ambientMusicPlayer),
      next: ambientMusicPlayer.next.bind(ambientMusicPlayer),
      previous: ambientMusicPlayer.previous.bind(ambientMusicPlayer),
      seek: ambientMusicPlayer.seek.bind(ambientMusicPlayer),
      setVolume: ambientMusicPlayer.setVolume.bind(ambientMusicPlayer),
    },
  };
}

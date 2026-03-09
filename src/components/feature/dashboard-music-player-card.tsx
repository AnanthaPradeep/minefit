"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Pause, Play, SkipBack, SkipForward, Upload, Volume2 } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAmbientMusicPlayer } from "@/lib/ambient-music-player";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SCOPES = ["user-read-email"];

function formatClock(secondsValue: number) {
  const safeValue = Math.max(0, Math.floor(secondsValue));
  const minutes = Math.floor(safeValue / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeValue % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function DashboardMusicPlayerCard() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [appStatus, setAppStatus] = useState("Use local files or open a music app search.");
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const { state, currentTrack, actions } = useAmbientMusicPlayer();
  const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
  const spotifyRedirectUri =
    (import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined)?.trim() ||
    `${window.location.origin}${window.location.pathname}`;

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const title = currentTrack?.name ?? "No track selected";
  const stateLabel = state.isPlaying ? "Playing" : "Paused";

  const base64UrlEncode = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  };

  const createRandomVerifier = (length = 64) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const random = new Uint8Array(length);
    crypto.getRandomValues(random);
    return Array.from(random)
      .map((value) => chars[value % chars.length])
      .join("");
  };

  const createCodeChallenge = async (verifier: string) => {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return base64UrlEncode(digest);
  };

  const connectSpotify = async () => {
    if (!spotifyClientId) {
      setAppStatus("Set VITE_SPOTIFY_CLIENT_ID in .env to enable Spotify connect.");
      return;
    }

    const verifier = createRandomVerifier();
    const challenge = await createCodeChallenge(verifier);
    const state = createRandomVerifier(24);
    localStorage.setItem("minefit_spotify_verifier", verifier);
    localStorage.setItem("minefit_spotify_state", state);

    const authParams = new URLSearchParams({
      client_id: spotifyClientId,
      response_type: "code",
      redirect_uri: spotifyRedirectUri,
      code_challenge_method: "S256",
      code_challenge: challenge,
      scope: SPOTIFY_SCOPES.join(" "),
      state,
    });

    window.location.href = `${SPOTIFY_AUTH_URL}?${authParams.toString()}`;
  };

  const exchangeSpotifyCode = async (code: string) => {
    if (!spotifyClientId) {
      setAppStatus("Spotify client ID is missing. Set VITE_SPOTIFY_CLIENT_ID.");
      return;
    }

    const verifier = localStorage.getItem("minefit_spotify_verifier");
    if (!verifier) {
      setAppStatus("Spotify verification key missing. Please connect again.");
      return;
    }

    const body = new URLSearchParams({
      client_id: spotifyClientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: spotifyRedirectUri,
      code_verifier: verifier,
    });

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      setAppStatus(`Spotify token exchange failed. Verify Redirect URI in Spotify app: ${spotifyRedirectUri}`);
      return;
    }

    const tokenData = await response.json();
    const expiresAt = Date.now() + Number(tokenData.expires_in ?? 0) * 1000;
    localStorage.setItem("minefit_spotify_access_token", tokenData.access_token ?? "");
    localStorage.setItem("minefit_spotify_refresh_token", tokenData.refresh_token ?? "");
    localStorage.setItem("minefit_spotify_expires_at", String(expiresAt));
    localStorage.removeItem("minefit_spotify_verifier");
    localStorage.removeItem("minefit_spotify_state");

    setSpotifyConnected(true);
    setAppStatus("Spotify connected. App-link sync is ready.");
  };

  const openProvider = (provider: "spotify" | "ytmusic" | "gaana") => {
    const query = encodeURIComponent(currentTrack?.name ?? "yoga focus music");
    const targets = {
      spotify: `https://open.spotify.com/search/${query}`,
      ytmusic: `https://music.youtube.com/search?q=${query}`,
      gaana: `https://gaana.com/search/${query}`,
    } as const;

    const popup = window.open(targets[provider], "_blank", "noopener,noreferrer");
    if (!popup) {
      setAppStatus("Popup blocked. Please allow popups for this site.");
      return;
    }

    const appName = provider === "ytmusic" ? "YouTube Music" : provider === "gaana" ? "Gaana" : "Spotify";
    setAppStatus(`${appName} opened in a new tab. Playback is controlled in that app.`);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("minefit_spotify_access_token");
    const expiresAt = Number(localStorage.getItem("minefit_spotify_expires_at") ?? "0");
    if (accessToken && expiresAt > Date.now()) {
      setSpotifyConnected(true);
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const storedState = localStorage.getItem("minefit_spotify_state");

    if (code && state && storedState && state === storedState) {
      exchangeSpotifyCode(code).catch(() => {
        setAppStatus("Spotify connect failed. Try again.");
      });

      params.delete("code");
      params.delete("state");
      const cleanSearch = params.toString();
      const cleanUrl = `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", cleanUrl);
      return;
    }

    const authError = params.get("error");
    if (authError) {
      setAppStatus(`Spotify auth error: ${authError}. Expected redirect URI: ${spotifyRedirectUri}`);
    }
  }, []);

  return (
    <Card className="relative overflow-hidden border-white/15 bg-zinc-900/60 shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-zinc-900/60">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/15 via-transparent to-emerald-500/10" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl text-white">Music Player</CardTitle>
            <CardDescription className="mt-1 text-base text-zinc-200">{title}</CardDescription>
          </div>
          <span className="rounded-full bg-zinc-700/30 px-2 py-1 text-xs font-semibold text-zinc-200">{stateLabel}</span>
        </div>

        <p className="mt-2 text-xs text-zinc-300">{state.status}</p>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.max(0, Math.min(100, progress))}
          onChange={(event) => actions.seek(Number(event.target.value))}
          className="h-2 w-full cursor-pointer accent-emerald-500"
          aria-label="Track progress"
        />
        <div className="mt-2 flex items-center justify-between text-sm text-zinc-300">
          <span>{formatClock(state.currentTime)}</span>
          <span>{formatClock(state.duration)}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" className="h-11 w-11 rounded-full border-zinc-600/60 bg-white/5 p-0 text-zinc-200 hover:bg-white/10" onClick={actions.previous} aria-label="Previous track">
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button size="lg" className="h-14 w-14 rounded-full p-0 shadow-lg" onClick={actions.togglePlay} aria-label={state.isPlaying ? "Pause" : "Play"}>
          {state.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button variant="outline" size="sm" className="h-11 w-11 rounded-full border-zinc-600/60 bg-white/5 p-0 text-zinc-200 hover:bg-white/10" onClick={actions.next} aria-label="Next track">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-2">
        <p className="text-xs font-medium text-zinc-300">Volume</p>
        <div className="mt-2 flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-zinc-300" />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(state.volume * 100)}
          onChange={(event) => actions.setVolume(Number(event.target.value) / 100)}
          className="h-2 flex-1 cursor-pointer accent-emerald-500"
          aria-label="Volume"
        />
          <span className="w-10 text-right text-xs text-zinc-300">{Math.round(state.volume * 100)}%</span>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-2">
        <p className="text-xs font-medium text-zinc-300">Local Music</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = event.currentTarget.files;
            if (!files) return;
            actions.loadFiles(files);
            event.currentTarget.value = "";
          }}
        />
          <Button variant="outline" className="rounded-full border-zinc-600/60 bg-white/5 text-zinc-200 hover:bg-white/10" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Load Music
        </Button>
          <span className="text-xs text-zinc-300">{state.tracks.length} tracks loaded</span>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-2">
        <p className="text-xs font-medium text-zinc-300">Music Apps</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button size="sm" variant={spotifyConnected ? "default" : "outline"} className="rounded-full border-zinc-600/60 bg-white/5 text-zinc-200 hover:bg-white/10" onClick={connectSpotify}>
            {spotifyConnected ? "Spotify Connected" : "Connect Spotify"}
          </Button>
          <Button size="sm" variant="outline" className="rounded-full border-zinc-600/60 bg-white/5 text-zinc-200 hover:bg-white/10" onClick={() => openProvider("spotify")}>
          Spotify
          <ExternalLink className="ml-1 h-3.5 w-3.5" />
        </Button>
          <Button size="sm" variant="outline" className="rounded-full border-zinc-600/60 bg-white/5 text-zinc-200 hover:bg-white/10" onClick={() => openProvider("ytmusic")}>
          YouTube Music
          <ExternalLink className="ml-1 h-3.5 w-3.5" />
        </Button>
          <Button size="sm" variant="outline" className="rounded-full border-zinc-600/60 bg-white/5 text-zinc-200 hover:bg-white/10" onClick={() => openProvider("gaana")}>
          Gaana
          <ExternalLink className="ml-1 h-3.5 w-3.5" />
        </Button>
        </div>
        <p className="mt-2 text-xs text-zinc-300">{appStatus}</p>
        <div className="mt-2 rounded-lg border border-white/10 bg-zinc-950/40 p-2 text-xs text-zinc-300">
          <p className="font-medium">Sync support</p>
          <p className="mt-1">Spotify: Connect + app-link sync (recommended now)</p>
          <p>YouTube Music: app-link only</p>
          <p>Gaana: app-link only</p>
        </div>
      </div>

      </div>
    </Card>
  );
}

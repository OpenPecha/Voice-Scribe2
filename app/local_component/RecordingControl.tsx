import { useState, useRef, useCallback } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { FaMicrophone, FaPlayCircle } from "react-icons/fa";
import { CiRepeat } from "react-icons/ci";
import WaveSurfer from "wavesurfer.js";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import toast from "react-hot-toast";

export default function RecordingControlContent() {
  const { user } = useLoaderData();
  const fetcher = useFetcher();
  const sidebarFetcher = useFetcher();

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setIsProcessing(false);
  }, []);

  const initializeWaveSurfer = useCallback(
    (url: string) => {
      if (!waveformRef.current) return;

      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
      }

      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "blue",
        progressColor: "blue",
        height: 80,
        barWidth: 2,
        cursorColor: "#1e40af",
        backend: "WebAudio",
        minPxPerSec: 50,
        interact: true,
      });

      waveSurferRef.current.load(url);
      waveSurferRef.current.on("finish", () => {
        if (isLooping) {
          waveSurferRef.current?.play();
        } else {
          setIsPlaying(false);
        }
      });
    },
    [isLooping]
  );

  const stopRecordingHandler = useCallback(() => {
    setIsProcessing(true);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setTimeout(() => {
        if (isProcessing) {
          cleanup();
          toast.error("Recording process timed out. Please try again.");
        }
      }, 3000);
    } else {
      cleanup();
    }
  }, [cleanup, isProcessing]);

  const startRecordingHandler = async () => {
    cleanup();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      let mimeType = "audio/mp4";
      if (!MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/webm";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          setAudioURL(url);
          setIsProcessing(false);

          setTimeout(() => {
            initializeWaveSurfer(url);
          }, 200);
        } else {
          cleanup();
          toast.error("No audio data was recorded");
        }
      };

      recorder.onerror = () => {
        cleanup();
        toast.error("Recording error occurred");
      };

      timeoutRef.current = setTimeout(() => {
        if (recorder.state === "recording") {
          stopRecordingHandler();
          toast("Recording limit reached (15 seconds)", {
            icon: "⏱️",
          });
        }
      }, 15000);

      recorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= 15) {
            stopRecordingHandler();
            return 15;
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      cleanup();
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast.error("Please allow microphone access and try again");
      } else {
        toast.error("Unable to start recording. Please refresh and try again");
      }
    }
  };

  const resetRecordingHandler = () => {
    cleanup();
    setAudioURL(null);
    setTranscript("");
    setIsPlaying(false);
    setIsLooping(false);
    setRecordingTime(0);
    if (waveSurferRef.current) {
      waveSurferRef.current.destroy();
    }
  };

  const togglePlayPause = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
      setIsPlaying(!waveSurferRef.current.isPlaying());
    }
  };

  const toggleLoop = () => {
    const newLoopState = !isLooping;
    setIsLooping(newLoopState);

    if (waveSurferRef.current) {
      waveSurferRef.current.un("finish");
      waveSurferRef.current.on("finish", () => {
        if (newLoopState) {
          waveSurferRef.current?.play();
        } else {
          waveSurferRef.current?.stop();
          setIsPlaying(false);
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (!audioURL || !transcript) {
      toast.error("Please record audio and add a transcript.");
      return;
    }
  
    try {
      const formData = new FormData();
      const audioBlob = await fetch(audioURL).then((res) => res.blob());
      const file = new File([audioBlob], `${Date.now()}_recording.mp3`, {
        type: audioBlob.type,
      });
  
      formData.append("file", file);
      formData.append("transcript", transcript);
      formData.append("modifiedById", user.id);
      formData.append("userEmail", user.email);
      formData.append("userRole", user.role);
  
      const submit = fetcher.submit(formData, {
        method: "POST",
        action: "/api/saveRecording",
        encType: "multipart/form-data",
      });
  
      await submit;
      resetRecordingHandler();
      toast.success("Recording saved successfully!");
      
      await sidebarFetcher.load(`/api/history?session=${user.email}&role=${user.role}`);
    } catch (error) {
      console.error("Error submitting recording:", error);
      toast.error("Failed to save recording. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-start h-screen pt-24">
      <div className="flex flex-col justify-start items-center w-full max-w-5xl space-y-6">
        <div className="flex justify-center items-center w-full px-4 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5">
          <div className="flex flex-col items-center w-full space-y-6">
            {!audioURL ? (
              <div className="flex flex-col items-center space-y-4">
                <button
                  className={`p-6 rounded-full text-white shadow-lg ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={
                    isRecording ? stopRecordingHandler : startRecordingHandler
                  }
                  disabled={isProcessing}
                  aria-label={
                    isRecording ? "Stop Recording" : "Start Recording"
                  }
                >
                  <FaMicrophone className="text-4xl" />
                </button>
                {isRecording && (
                  <div className="text-lg font-semibold">
                    Recording: {recordingTime}s / 15s
                  </div>
                )}
                {isProcessing && (
                  <div className="text-sm text-gray-500">
                    Processing recording...
                  </div>
                )}
              </div>
            ) : (
              <>
                <div
                  ref={waveformRef}
                  className="w-full max-w-xl h-24 rounded-lg bg-gray-300 shadow-md"
                />
                <div className="flex justify-center space-x-6 mt-4">
                  <button
                    onClick={togglePlayPause}
                    className="flex justify-center items-center w-14 h-14 text-black rounded-full bg-gray-300 hover:bg-gray-400 shadow-md"
                    aria-label="Play/Pause"
                  >
                    <FaPlayCircle className="text-3xl" />
                  </button>
                  <button
                    onClick={toggleLoop}
                    className="flex justify-center items-center w-14 h-14 text-black rounded-full bg-gray-300 hover:bg-gray-400 shadow-md"
                    aria-label="Repeat"
                  >
                    <CiRepeat
                      className={`text-3xl ${
                        isLooping ? "text-blue-500" : "text-gray-500"
                      }`}
                    />
                  </button>
                </div>
                <Button
                  onClick={resetRecordingHandler}
                  className="p-6 max-w-sm text-lg rounded-lg bg-red-500 hover:bg-red-600 focus:outline-none text-white"
                >
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col w-full px-4 items-center sm:items-start space-y-6">
          <Textarea
            className={`w-full max-w-5xl p-6 h-32 sm:h-40 md:h-48 lg:h-56 !text-lg text-black rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isPlaying ? "caret-transparent" : ""
            }mt-8`}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <Button
            className="p-6 max-w-sm text-lg text-white rounded-lg bg-blue-500 hover:bg-blue-600 focus:outline-none shadow-md self-center"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}


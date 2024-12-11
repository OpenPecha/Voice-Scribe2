import React, { useState, useEffect, useRef } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { FaMicrophone, FaPlayCircle } from "react-icons/fa";
import { CiShuffle, CiRepeat } from "react-icons/ci";
import WaveSurfer from "wavesurfer.js";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { MyContextProvider, useMyContext } from "~/MyContext";

interface Recording {
  id: string;
  fileUrl: string | null;
  transcript: string | null;
  reviewed_transcript: string | null;
  helper_text: string | null;
}

export default function RecordingControl({
  recordings,
}: {
  recordings: Recording[];
}) {
  return (
    <MyContextProvider>
      <RecordingControlContent recordings={recordings} />
    </MyContextProvider>
  );
}

function RecordingControlContent({ recordings }: { recordings: Recording[] }) {
  const { isRecording, startRecording, stopRecording, resetRecording } =
    useMyContext();

  const fetcher = useFetcher();
  const { user } = useLoaderData();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [waveColor, setWaveColor] = useState("blue");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
      }
    };
  }, [audioStream]);

  useEffect(() => {
    if (audioURL && waveformRef.current) {
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
      }

      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: waveColor,
        progressColor: "blue",
        height: 100,
        barWidth: 2,
        cursorColor: cursorVisible ? "blue" : "transparent",
        backend: "MediaElement",
      });

      waveSurferRef.current.load(audioURL);

      const handleFinish = () => {
        setIsPlaying(false);

        // Handle repeat modes
        if (repeatMode === "one") {
          waveSurferRef.current?.seekTo(0);
          waveSurferRef.current?.play();
          setIsPlaying(true);
        } else if (repeatMode === "all") {
          const nextIndex = (currentIndex + 1) % recordings.length;
          setCurrentIndex(nextIndex);
          setAudioURL(recordings[nextIndex].fileUrl);
        }
      };

      waveSurferRef.current.on("finish", handleFinish);

      return () => {
        if (waveSurferRef.current) {
          waveSurferRef.current.un("finish", handleFinish);
          waveSurferRef.current.destroy();
        }
      };
    }
  }, [audioURL, waveColor, repeatMode, currentIndex, recordings]);

  const startRecordingHandler = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioStream(stream);

      recorder.ondataavailable = (event) => {
        setAudioBlob(event.data);
        setAudioURL(URL.createObjectURL(event.data));
      };
      recorder.start();
      startRecording(); // Use context method
    } catch (error) {
      console.error("Error accessing audio devices:", error);
      alert("Unable to access audio devices.");
    }
  };

  const stopRecordingHandler = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      stopRecording(); // Use context method
    }
  };

  const resetRecordingHandler = () => {
    setAudioURL(null);
    setTranscript("");
    setAudioBlob(null);
    setIsPlaying(false);
    setCursorVisible(true);
    waveSurferRef.current?.destroy();
    resetRecording(); // Use context method
  };

  const togglePlayPause = () => {
    if (waveSurferRef.current) {
      if (!waveSurferRef.current.isPlaying()) {
        waveSurferRef.current.play();
        setIsPlaying(true);
        setCursorVisible(false);
      } else {
        waveSurferRef.current.pause();
        setIsPlaying(false);
        setCursorVisible(true);
      }
    }
  };

  const handleRepeat = () => {
    setRepeatMode((prevMode) =>
      prevMode === "none" ? "one" : prevMode === "one" ? "all" : "none"
    );
  };

  const handleSubmit = async () => {
    if (audioBlob && transcript) {
      const formData = new FormData();
      const file = new File(
        [audioBlob],
        `audio.${audioBlob.type.split("/")[1]}`,
        {
          type: audioBlob.type,
        }
      );
      formData.append("file", file);
      formData.append("transcript", transcript);
      formData.append("modifiedById", user.id);

      fetcher.submit(formData, {
        method: "POST",
        action: "/api/saveRecording",
      });
    } else {
      alert("Please record audio and add a transcript.");
    }
  };

  console.log("recoding UI");

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col justify-center items-center w-full max-w-5xl space-y-8">
        <div className="flex justify-center items-center w-full sm:w-1/2">
          <div className="flex flex-col items-center w-full space-y-6 mt-4">
            {!audioURL ? (
              <button
                className={`p-6 rounded-full text-white shadow-lg ${
                  isRecording ? "bg-red-500 hover:bg-red-600" 
                  : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={isRecording ? stopRecordingHandler : startRecordingHandler}
                aria-label={isRecording ? "Stop Recording" : "Start Recording"}
              >
                <FaMicrophone className="text-4xl" />
              </button>
            ) : (
              <>
                <div ref={waveformRef} className="w-full max-w-xl h-40 rounded-lg bg-gray-300 shadow-md"></div>
                <div className="flex justify-center space-x-6 mt-4">
                  <button onClick={togglePlayPause} className="flex justify-center items-center w-14 h-14 text-black rounded-full bg-gray-300 hover:bg-gray-400 shadow-md" aria-label="Play/Pause" ><FaPlayCircle className="text-3xl" /></button>
                  <button onClick={handleRepeat} className="flex justify-center items-center w-14 h-14 text-black rounded-full bg-gray-300 hover:bg-gray-400 shadow-md" aria-label="Repeat" ><CiRepeat className={`text-3xl ${
                    repeatMode === "none"
                      ? "text-black"
                      : repeatMode === "one"
                      ? "text-blue-500"
                      : "text-green-500"
                  }`}/></button>
                </div>
                <Button onClick={resetRecordingHandler}  className="p-6 max-w-sm text-lg text-white rounded-lg bg-red-500 hover:bg-red-600 focus:outline-none text-white">Reset</Button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col w-full sm:w-full items-center sm:items-start space-y-6">
          <Textarea className={`w-full max-w-5xl p-6 h-[400px] text-black rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isPlaying ? "caret-transparent" : ""
            }mt-8`}
            rows={8}
            value={transcript} 
            onChange={(e) => setTranscript(e.target.value)} />
          <Button 
          className="p-6 max-w-sm text-lg text-white rounded-lg bg-blue-500 hover:bg-blue-600 focus:outline-none shadow-md self-center"
          onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
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

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const waveformRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data?.error) {
        toast.error(fetcher.data?.error);
      } else if (fetcher.data?.success) {
        toast.success("Recording saved successfully!");
      }
    }
  }, [fetcher]);

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
        waveColor: "blue",
        progressColor: "blue",
        height: 100,
        barWidth: 2,
        cursorColor: "#1e40af",
        backend: "WebAudio",
        minPxPerSec: 50,
        interact: true,
      });

      waveSurferRef.current.load(audioURL);

      waveSurferRef.current.on("finish", () => {
        if (isLooping) {
          waveSurferRef.current?.play();
        } else {
          setIsPlaying(false);
        }
      });
    }
  }, [audioURL, isLooping]);
  const startRecordingHandler = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      let mimeType = 'audio/mp4';
    if (!MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/webm';
    }

      const recorder = new MediaRecorder(stream, { mimeType });
      setMediaRecorder(recorder);

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setAudioURL(URL.createObjectURL(blob));
      };

      recorder.start();
    setIsRecording(true);
  } catch (error) {
    console.error("Microphone access error:", error);
    alert("Unable to access microphone. Please check permissions.");
  }
};

  const stopRecordingHandler = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      audioStream?.getTracks().forEach((track) => track.stop());
    }
  };

  const resetRecordingHandler = () => {
    setAudioURL(null);
    setTranscript("");
    setIsPlaying(false);
    setIsLooping(false);
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
    setIsLooping(!isLooping);
  };

  const handleSubmit = async () => {
    if (audioURL && transcript) {
      const formData = new FormData();
      const audioBlob = await fetch(audioURL).then((res) => res.blob());
      const file = new File([audioBlob], Date.now() + "recording.mp3", {
        type: audioBlob.type,
      });
      formData.append("file", file);
      formData.append("transcript", transcript);
      formData.append("modifiedById", user.id);

      fetcher.submit(formData, {
        method: "POST",
        action: "/api/saveRecording",
        encType: "multipart/form-data",
      });
      resetRecordingHandler();
    } else {
      alert("Please record audio and add a transcript.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col justify-center items-center w-full max-w-5xl space-y-8">
        <div className="flex justify-center items-center w-full sm:w-1/2">
          <div className="flex flex-col items-center w-full space-y-6 mt-4">
            {!audioURL ? (
              <button
                className={`p-6 rounded-full text-white shadow-lg ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={
                  isRecording ? stopRecordingHandler : startRecordingHandler
                }
                aria-label={isRecording ? "Stop Recording" : "Start Recording"}
              >
                <FaMicrophone className="text-4xl" />
              </button>
            ) : (
              <>
                <div
                  ref={waveformRef}
                  className="w-full max-w-xl h-40 rounded-lg bg-gray-300 shadow-md"
                ></div>
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
        <div className="flex flex-col w-full sm:w-full items-center sm:items-start space-y-6">
          <Textarea
          style={{ fontSize: "16px" }}
          className={`w-full max-w-5xl p-6 h-[400px] text-black rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isPlaying ? "caret-transparent" : ""
          }mt-8`}
            rows={8}
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

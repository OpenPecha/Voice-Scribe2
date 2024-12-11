import React, { useEffect, useReducer, useRef } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { CiRepeat } from "react-icons/ci"
import WaveSurfer from "wavesurfer.js";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

interface Recording {
  id: string;
  fileUrl: string;
  transcript: string;
  reviewed_transcript: string | null;
}

interface ReviewerProps {
  recording: Recording;
  onAccept: (id: string, reviewedTranscript: string) => void;
  onReject: (id: string) => void;
}

interface State {
  isPlaying: boolean;
  reviewed_transcript: string;
  repeatMode: boolean;
}

type Action =
  | { type: "TOGGLE_PLAY"; payload: boolean }
  | { type: "TOGGLE_REPEAT"; payload: boolean }
  | { type: "SET_REVIEWED_TRANSCRIPT"; payload: string };

// Reducer function to handle state changes
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_PLAY":
      return { ...state, isPlaying: action.payload };
    case "TOGGLE_REPEAT":
      return { ...state, repeatMode: action.payload };
    case "SET_REVIEWED_TRANSCRIPT":
      return { ...state, reviewed_transcript: action.payload };
    default:
      return state;
  }
}

export default function Reviewer({ recording, onAccept, onReject }: ReviewerProps) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  
  const [state, dispatch] = useReducer(reducer, {
    isPlaying: false,
    reviewed_transcript: recording.transcript || "",  
    repeatMode: false
  });

  useEffect(() => {
    if (waveformRef.current && recording.fileUrl) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#0000FF",
        progressColor: "#007bff",
        cursorColor: "#007bff",
        height: 80,
      });
      
      waveSurferRef.current.load(recording.fileUrl);
      
      waveSurferRef.current.on("finish", () => {
        dispatch({ type: "TOGGLE_PLAY", payload: false });
        
        if (state.repeatMode && waveSurferRef.current) {
          waveSurferRef.current.play();
          dispatch({ type: "TOGGLE_PLAY", payload: true });
        }
      });
      
      return () => {
        waveSurferRef.current?.destroy();
      };
    }
  }, [recording.fileUrl, state.repeatMode]);

  const togglePlayPause = () => {
    if (waveSurferRef.current) {
      if (state.isPlaying) {
        waveSurferRef.current.pause();
      } else {
        waveSurferRef.current.play();
      }
      dispatch({ type: "TOGGLE_PLAY", payload: !state.isPlaying });
    }
  };

  const toggleRepeatMode = () => {
    dispatch({ type: "TOGGLE_REPEAT", payload: !state.repeatMode });
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div ref={waveformRef} className="w-full max-w-xl bg-gray-200 rounded" />
      {/* Play/Pause Buttons */}
      <div className="flex space-x-4">
        <Button 
          onClick={togglePlayPause} 
          className="bg-blue-500" 
          aria-label="Play/Pause"
        >
          <FaPlayCircle className={state.isPlaying ? "Pause" : "Play"} />
        </Button>
        
        {/* Repeat Mode Button */}
        <Button
          onClick={toggleRepeatMode}
          className={`bg-${state.repeatMode ? 'green' : 'gray'}-500`}
          aria-label="Toggle Repeat"
        >
          <CiRepeat color={state.repeatMode ? 'white' : 'black'} />
        </Button>
      </div>
      
      {/* Transcript Textarea */}
      <Textarea
        value={state.reviewed_transcript}
        onChange={(e) =>
          dispatch({ 
            type: "SET_REVIEWED_TRANSCRIPT", 
            payload: e.target.value 
          })
        }
        rows={5}
        className="max-w-3xl w-full h-[400px] mx-auto bg-white shadow-lg rounded-lg p-6 text-black"
      />
      
      {/* Accept/Reject Buttons */}
      <div className="flex space-x-4">
        <Button 
          onClick={() => onReject(recording.id)} 
          className="bg-red-500"
        >
          Reject
        </Button>
        <Button 
          onClick={() => onAccept(recording.id, state.reviewed_transcript)} 
          className="bg-green-500"
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
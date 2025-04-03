import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Square, Save, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatDuration } from '@/lib/utils';

interface AudioRecorderProps {
  questionId: string;
  isRecording: boolean;
  onToggleRecording: () => void;
  onAudioRecorded: (audioBlob: Blob) => void;
  hasRecording: boolean;
}

export function AudioRecorder({
  questionId,
  isRecording,
  onToggleRecording,
  onAudioRecorded,
  hasRecording
}: AudioRecorderProps) {
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [recordingAvailable, setRecordingAvailable] = useState<boolean>(hasRecording);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set up audio element
  useEffect(() => {
    try {
      audioRef.current = new Audio();
      if (audioRef.current) {
        audioRef.current.onended = () => setIsPlaying(false);
      }
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
      };
    } catch (err) {
      console.error("Error setting up audio element:", err);
      setError("Failed to set up audio playback");
    }
  }, []);

  // Handle recording state changes
  useEffect(() => {
    let cleanupFunction = () => {};

    const setupRecording = async () => {
      if (isRecording) {
        try {
          await startRecording();
        } catch (err) {
          console.error("Error starting recording:", err);
          setError(err instanceof Error ? err.message : "Failed to start recording");
          onToggleRecording(); // Turn off recording state
        }
      } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        stopRecording();
      }
    };

    setupRecording();
    
    cleanupFunction = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    
    return cleanupFunction;
  }, [isRecording]);

  // Check if browser supports media devices
  const isBrowserSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  // Start recording function
  const startRecording = async () => {
    try {
      setError(null);
      
      if (!isBrowserSupported()) {
        throw new Error('Your browser does not support audio recording.');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        .catch(err => {
          console.error('Media device error:', err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            throw new Error('Microphone permission denied. Please allow microphone access.');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            throw new Error('No microphone found. Please connect a microphone.');
          } else {
            throw new Error(`Could not access microphone: ${err.message}`);
          }
        });
      
      // Reset recording state
      audioChunksRef.current = [];
      setRecordingTime(0);
      setAudioUrl(null);
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          console.warn('No audio data collected');
          setError('No audio was recorded. Please try again.');
          return;
        }
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setRecordingAvailable(true);
          
          // Pass the audio blob to parent component
          onAudioRecorded(audioBlob);
        } catch (err) {
          console.error('Error processing audio:', err);
          setError('Failed to process recorded audio.');
        } finally {
          // Clean up stream tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred.');
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError(error instanceof Error ? error.message : 'Unknown recording error');
      onToggleRecording(); // Turn off recording state in case of error
      throw error; // Re-throw to let parent component know
    }
  };

  // Stop recording function
  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to stop recording properly.');
    }
  };

  // Play audio function
  const playAudio = () => {
    try {
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play()
          .catch(err => {
            console.error('Error playing audio:', err);
            setError('Failed to play the recording.');
          });
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play the recording.');
    }
  };

  // Stop audio function
  const stopAudio = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Error stopping audio playback:', err);
    }
  };

  // Delete recording function
  const deleteRecording = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      
      setRecordingAvailable(false);
      setIsPlaying(false);
      setRecordingTime(0);
      setError(null);
      
      // Send empty blob to parent to indicate deletion
      onAudioRecorded(new Blob([]));
    } catch (err) {
      console.error('Error deleting recording:', err);
      setError('Failed to delete the recording.');
    }
  };

  return (
    <div className="border rounded-md p-4 bg-card">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded p-2 mb-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {recordingAvailable ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Recording Available</div>
            <div className="text-sm text-muted-foreground">{formatDuration(recordingTime)}</div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isPlaying ? (
              <Button
                variant="outline"
                size="sm"
                onClick={stopAudio}
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={playAudio}
                disabled={!audioUrl}
              >
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
            )}
            
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteRecording}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              {isRecording ? 'Recording in progress...' : 'No recording yet'}
            </div>
            {isRecording && (
              <div className="text-sm text-red-500 font-medium">{formatDuration(recordingTime)}</div>
            )}
          </div>
          
          {isRecording && (
            <Progress value={recordingTime % 60 * 1.667} max={100} className="h-1" />
          )}
          
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={onToggleRecording}
            className="w-full"
            disabled={!isBrowserSupported()}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 
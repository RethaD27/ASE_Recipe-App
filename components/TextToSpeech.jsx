"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  Mic,
  Pause,
  Play,
  Rewind,
  FastForward,
  VolumeX,
  Volume1,
} from "lucide-react";

export default function TextToSpeech({ instructions }) {
  // State management
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);

  // Refs for speech APIs
  const utteranceQueueRef = useRef([]);
  const speechRecognitionRef = useRef(null);

  // Initialize Speech APIs
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ensure continuous speech for all instructions
      window.speechSynthesis.cancel();

      // Speech Recognition Initialization
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = handleVoiceCommand;
        recognition.onerror = handleSpeechRecognitionError;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        speechRecognitionRef.current = recognition;
      } else {
        setError("Speech recognition not supported in this browser");
      }
    }

    return () => {
      window.speechSynthesis.cancel();
      speechRecognitionRef.current?.stop();
    };
  }, []);

  // Speak instructions in queue
  const speakInstructions = useCallback(() => {
    if (!instructions.length) return;

    // Clear any existing utterances
    utteranceQueueRef.current = instructions.map((instruction, index) => {
      const utterance = new SpeechSynthesisUtterance(instruction);
      utterance.rate = speechRate;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentStep(index); // Update current step when speaking starts
      };
      utterance.onend = () => {
        if (utteranceQueueRef.current.length > 0) {
          utteranceQueueRef.current.shift();
          if (utteranceQueueRef.current.length > 0) {
            window.speechSynthesis.speak(utteranceQueueRef.current[0]);
          } else {
            setIsSpeaking(false);
            setIsActive(false); // End voice assistant when all instructions are spoken
          }
        }
      };

      return utterance;
    });

    // Start speaking the first instruction
    if (utteranceQueueRef.current.length > 0) {
      window.speechSynthesis.speak(utteranceQueueRef.current[0]);
      setCurrentStep(0);
    }
  }, [instructions, speechRate]);

  // Start Voice Assistant
  const startVoiceAssistant = () => {
    if (!instructions.length) {
      setError("No instructions available");
      return;
    }

    setIsActive(true);
    setIsPaused(false);
    speakInstructions();

    // Start speech recognition
    try {
      speechRecognitionRef.current?.start();
    } catch (err) {
      setError("Failed to start voice recognition");
    }
  };

  // Stop Voice Assistant
  const stopVoiceAssistant = () => {
    window.speechSynthesis.cancel();
    utteranceQueueRef.current = [];
    speechRecognitionRef.current?.stop();

    setIsActive(false);
    setCurrentStep(0);
    setIsSpeaking(false);
    setIsListening(false);
    setIsPaused(false);
  };

  // Handle Voice Commands
  const handleVoiceCommand = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript
      .trim()
      .toLowerCase();

    console.log("Voice Command:", transcript);

    // Enhanced command parsing with multiple variations
    switch (true) {
      case /next\s*(step)?/.test(transcript):
        goToNextStep();
        break;
      case /previous\s*(step)?|go\s*back/.test(transcript):
        goToPreviousStep();
        break;
      case /repeat\s*(step)?/.test(transcript):
        repeatCurrentStep();
        break;
      case /pause/.test(transcript):
        pauseVoiceAssistant();
        break;
      case /resume/.test(transcript):
        resumeVoiceAssistant();
        break;
      case /stop/.test(transcript):
        stopVoiceAssistant();
        break;
      case /skip\s*this\s*step/.test(transcript):
        goToNextStep();
        break;
      case /go\s*to\s*step\s*(\d+)/.test(transcript): {
        const match = transcript.match(/go\s*to\s*step\s*(\d+)/);
        if (match) {
          const stepNumber = parseInt(match[1], 10);
          jumpToStep(stepNumber - 1);
        }
        break;
      }
    }
  };

  // Navigation and Playback Methods
  const goToNextStep = () => {
    const nextStep = Math.min(currentStep + 1, instructions.length - 1);
    setCurrentStep(nextStep);

    // Cancel current speech and speak the next instruction
    window.speechSynthesis.cancel();
    const nextUtterance = new SpeechSynthesisUtterance(instructions[nextStep]);
    nextUtterance.rate = speechRate;
    window.speechSynthesis.speak(nextUtterance);
  };

  const goToPreviousStep = () => {
    const prevStep = Math.max(currentStep - 1, 0);
    setCurrentStep(prevStep);

    // Cancel current speech and speak the previous instruction
    window.speechSynthesis.cancel();
    const prevUtterance = new SpeechSynthesisUtterance(instructions[prevStep]);
    prevUtterance.rate = speechRate;
    window.speechSynthesis.speak(prevUtterance);
  };

  const repeatCurrentStep = () => {
    // Cancel current speech and repeat current instruction
    window.speechSynthesis.cancel();
    const currentUtterance = new SpeechSynthesisUtterance(
      instructions[currentStep]
    );
    currentUtterance.rate = speechRate;
    window.speechSynthesis.speak(currentUtterance);
  };

  const jumpToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < instructions.length) {
      setCurrentStep(stepIndex);

      // Cancel current speech and speak the selected instruction
      window.speechSynthesis.cancel();
      const jumpUtterance = new SpeechSynthesisUtterance(
        instructions[stepIndex]
      );
      jumpUtterance.rate = speechRate;
      window.speechSynthesis.speak(jumpUtterance);
    }
  };

  // Speech Control Methods
  const pauseVoiceAssistant = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeVoiceAssistant = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  // Speech Rate Adjustment
  const adjustSpeechRate = (increase) => {
    const newRate = increase
      ? Math.min(2, speechRate + 0.25)
      : Math.max(0.5, speechRate - 0.25);
    setSpeechRate(newRate);

    // Update current speech rate if speaking
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      const rateAdjustedUtterance = new SpeechSynthesisUtterance(
        instructions[currentStep]
      );
      rateAdjustedUtterance.rate = newRate;
      window.speechSynthesis.speak(rateAdjustedUtterance);
    }
  };

  // Error Handling
  const handleSpeechRecognitionError = (event) => {
    console.error("Speech recognition error:", event);
    setError("Speech to text feature failed");
    setIsListening(false);
  };

  // Render
  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      {/* Initial Start Button */}
      {!isActive ? (
        <button
          onClick={startVoiceAssistant}
          className="flex items-center gap-3 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          <Volume2 className="w-6 h-6" />
          <span className="font-medium">Read Instructions</span>
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500 ease-in-out"
              style={{
                width: `${((currentStep + 1) / instructions.length) * 100}%`,
              }}
            />
          </div>

          {/* Current Step Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
              <span className="text-teal-500">Step {currentStep + 1}</span>
              <span className="text-sm text-gray-400">
                of {instructions.length}
              </span>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {instructions[currentStep]}
            </p>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            {/* Speed Controls */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => adjustSpeechRate(false)}
                  disabled={speechRate <= 0.5}
                  className="flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Volume1 className="w-5 h-5" />
                </button>
                <span className="font-medium text-gray-600 dark:text-gray-300 min-w-[4ch] text-center">
                  {speechRate.toFixed(1)}x
                </span>
                <button
                  onClick={() => adjustSpeechRate(true)}
                  disabled={speechRate >= 2}
                  className="flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Listening Status */}
              <div
                className={`flex items-center gap-3 ${
                  isListening ? "text-teal-500" : "text-gray-400"
                } transition-colors duration-300`}
              >
                <Mic className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {isListening ? "Listening..." : "Voice Ready"}
                </span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0}
                  className="flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Rewind className="w-6 h-6" />
                </button>

                <button
                  onClick={
                    isPaused ? resumeVoiceAssistant : pauseVoiceAssistant
                  }
                  className="flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                >
                  {isPaused ? (
                    <Play className="w-6 h-6" />
                  ) : (
                    <Pause className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={goToNextStep}
                  disabled={currentStep === instructions.length - 1}
                  className="flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FastForward className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={stopVoiceAssistant}
                className="flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
              >
                <VolumeX className="w-5 h-5 mr-2" />
                <span className="font-medium">Stop</span>
              </button>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {instructions.map((_, index) => (
              <button
                key={index}
                onClick={() => jumpToStep(index)}
                className={`flex items-center justify-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors ${
                  currentStep === index ? "bg-teal-700 dark:bg-teal-800" : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Error Handling */}
          {error && (
            <div className="fixed bottom-4 right-4 max-w-sm animate-slide-up">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-red-500 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-red-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Question, Screen } from "./types";
import { defaultQuestions } from "./data/questions";
import { useSettings } from "./hooks/useSettings";
import { useSound } from "./hooks/useSound";
import LoadingScreen from "./components/LoadingScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import SettingsPanel from "./components/SettingsPanel";
import QuestionScreen from "./components/QuestionScreen";
import AnswerReveal from "./components/AnswerReveal";
import FinalScreen from "./components/FinalScreen";
import AdminPanel from "./components/AdminPanel";

const QUESTIONS_KEY = "movie-quiz-questions";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadQuestions(): Question[] {
  try {
    const saved = localStorage.getItem(QUESTIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter(
          (q) => q && typeof q.id === "number" && typeof q.answer === "string" && q.answer.trim().length > 0
        );
        if (valid.length > 0) return valid;
      }
    }
  } catch {}
  return defaultQuestions;
}

function saveQuestions(qs: Question[]) {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(qs));
  } catch {}
}

export default function App() {
  const [, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("loading");
  const [showSettings, setShowSettings] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(loadQuestions);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const { settings, update: updateSettings } = useSettings();

  // Root level ambient soundtrack generator
  useSound(settings.enableSounds, settings.enableMusic);

  // Persist questions to localStorage whenever they change
  useEffect(() => {
    saveQuestions(questions);
  }, [questions]);

  const handleLoadDone = useCallback(() => {
    setLoaded(true);
    setScreen("welcome");
  }, []);

  const startQuiz = useCallback(() => {
    const sourceQuestions = questions.length > 0 ? questions : defaultQuestions;
    let qs = [...sourceQuestions];
    if (settings.shuffleQuestions) qs = shuffle(qs);
    setActiveQuestions(qs);
    setCurrentIndex(0);
    setStartTime(Date.now());

    if (settings.fullscreenOnStart) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }

    setScreen("quiz");
  }, [questions, settings.shuffleQuestions, settings.fullscreenOnStart]);

  const handleReveal = useCallback(() => {
    setScreen("answer");
  }, []);

  const handleNext = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= activeQuestions.length) {
      setEndTime(Date.now());
      setScreen("final");
    } else {
      setCurrentIndex(nextIdx);
      setScreen("quiz");
    }
  }, [currentIndex, activeQuestions.length]);

  const handleRestart = useCallback(() => {
    startQuiz();
  }, [startQuiz]);

  const handleHome = useCallback(() => {
    setScreen("welcome");
    setCurrentIndex(0);
  }, []);

  const handleQuestionsChange = useCallback((qs: Question[]) => {
    setQuestions(qs);
  }, []);

  const bg = "fixed inset-0 -z-20 bg-[#08081a]";

  return (
    <div className="relative min-h-screen">
      {/* Base background */}
      <div className={bg} />

      {/* Animated mesh gradient */}
      <div
        className="fixed inset-0 -z-10 opacity-30 animate-gradient"
        style={{
          background:
            "linear-gradient(135deg, #1a0a2e 0%, #08081a 25%, #0a1628 50%, #12082a 75%, #08081a 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        {screen === "loading" && (
          <LoadingScreen key="loading" onDone={handleLoadDone} />
        )}

        {screen === "welcome" && (
          <WelcomeScreen
            key="welcome"
            onStart={startQuiz}
            onSettings={() => setShowSettings(true)}
            onAdmin={() => setScreen("admin")}
            shuffle={settings.shuffleQuestions}
            onToggleShuffle={() => updateSettings({ shuffleQuestions: !settings.shuffleQuestions })}
            questionCount={questions.length}
          />
        )}

        {screen === "quiz" && (
          activeQuestions[currentIndex] ? (
            <QuestionScreen
              key={`quiz-${currentIndex}`}
              question={activeQuestions[currentIndex]}
              index={currentIndex}
              total={activeQuestions.length}
              settings={settings}
              onReveal={handleReveal}
              onRestart={handleRestart}
            />
          ) : (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
              <p className="text-white/60 mb-4 font-mono">No active question found</p>
              <button onClick={handleHome} className="btn-primary px-6 py-2 rounded-xl text-white">
                Back to Home
              </button>
            </div>
          )
        )}

        {screen === "answer" && (
          activeQuestions[currentIndex] ? (
            <AnswerReveal
              key={`answer-${currentIndex}`}
              question={activeQuestions[currentIndex]}
              index={currentIndex}
              total={activeQuestions.length}
              settings={settings}
              onNext={handleNext}
            />
          ) : (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
              <button onClick={handleHome} className="btn-primary px-6 py-2 rounded-xl text-white">
                Back to Home
              </button>
            </div>
          )
        )}

        {screen === "final" && (
          <FinalScreen
            key="final"
            total={activeQuestions.length}
            elapsedMs={Math.max(0, endTime - startTime)}
            settings={settings}
            onReplay={startQuiz}
            onHome={handleHome}
          />
        )}

        {screen === "admin" && (
          <AdminPanel
            key="admin"
            questions={questions}
            onChange={handleQuestionsChange}
            onClose={() => setScreen("welcome")}
          />
        )}
      </AnimatePresence>

      {/* Settings overlay (available from welcome) */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onUpdate={updateSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

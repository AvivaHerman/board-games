import { useState, useRef, useEffect, useCallback } from 'react';
import type { GameComponentProps } from '../../types';
import { parseCommands, executeAll, type TurtleState, type Command } from './logic';
import styles from './Turtle.module.css';

type Phase = 'setup' | 'animating' | 'result';

const DIRECTION_ARROWS: Record<string, string> = {
  N: '▲',
  E: '▶',
  S: '▼',
  W: '◀',
};

const DIRECTION_LABELS: Record<string, string> = {
  N: 'North',
  E: 'East',
  S: 'South',
  W: 'West',
};

export function Turtle({ onGameEnd }: GameComponentProps) {
  const [gridSize, setGridSize] = useState(5);
  const [commandInput, setCommandInput] = useState('');
  const [phase, setPhase] = useState<Phase>('setup');
  const [trace, setTrace] = useState<TurtleState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);
  const startTime = useRef(Date.now());
  const intervalRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  const currentState = trace[currentStep] || { x: 1, y: 1, direction: 'N' };

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const finishGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearTimer();
    setPhase('result');
    onGameEnd({ winner: 'player', durationMs: Date.now() - startTime.current });
  }, [clearTimer, onGameEnd]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  function handleGo() {
    const parsed = parseCommands(commandInput);
    if (parsed.length === 0) return;
    const fullTrace = executeAll(parsed, gridSize);
    setCommands(parsed);
    setTrace(fullTrace);
    setCurrentStep(0);
    setPhase('animating');
    startTime.current = Date.now();
    endedRef.current = false;
  }

  useEffect(() => {
    if (phase !== 'animating') return;
    if (currentStep >= trace.length - 1) {
      finishGame();
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setCurrentStep((s) => {
        const next = s + 1;
        if (next >= trace.length - 1) {
          finishGame();
        }
        return Math.min(next, trace.length - 1);
      });
    }, 400);
    return clearTimer;
  }, [phase, trace.length, clearTimer, finishGame, currentStep]);

  function handleSkip() {
    setCurrentStep(trace.length - 1);
    finishGame();
  }

  const cellSize = Math.min(36, 400 / gridSize);

  return (
    <div className={styles.container}>
      {phase === 'setup' && (
        <div className={styles.setupForm}>
          <div className={styles.inputGroup}>
            <label>Grid Size</label>
            <div className={styles.sliderRow}>
              <input
                type="range"
                min={1}
                max={20}
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
              />
              <span className={styles.sliderValue}>{gridSize}</span>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Commands (F = Forward, L = Left, R = Right)</label>
            <input
              className={styles.commandInput}
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="e.g. FFRFLFF"
              onKeyDown={(e) => e.key === 'Enter' && handleGo()}
            />
          </div>
          <button
            className={styles.goButton}
            onClick={handleGo}
            disabled={parseCommands(commandInput).length === 0}
          >
            Go
          </button>
        </div>
      )}

      {(phase === 'animating' || phase === 'result') && (
        <>
          <div
            className={styles.grid}
            style={{
              gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
            }}
          >
            {Array.from({ length: gridSize * gridSize }, (_, i) => {
              const col = i % gridSize;
              const row = Math.floor(i / gridSize);
              const cellX = col + 1;
              const cellY = gridSize - row;
              const isTurtle = cellX === currentState.x && cellY === currentState.y;
              return (
                <div
                  key={i}
                  className={`${styles.cell} ${isTurtle ? styles.turtleCell : ''}`}
                >
                  {isTurtle && (
                    <span className={styles.turtle}>
                      {DIRECTION_ARROWS[currentState.direction]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {phase === 'animating' && (
            <>
              <div className={styles.commandDisplay}>
                {commands.map((cmd, i) => (
                  <span
                    key={i}
                    className={
                      i === currentStep
                        ? styles.activeCommand
                        : i < currentStep
                          ? styles.executedCommand
                          : ''
                    }
                  >
                    {cmd}
                  </span>
                ))}
              </div>
              <button className={styles.skipButton} onClick={handleSkip}>
                Skip
              </button>
            </>
          )}

          {phase === 'result' && (
            <div className={styles.result}>
              Position: <span className={styles.resultHighlight}>({currentState.x}, {currentState.y})</span>
              <br />
              Facing: <span className={styles.resultHighlight}>{DIRECTION_LABELS[currentState.direction]} ({currentState.direction})</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

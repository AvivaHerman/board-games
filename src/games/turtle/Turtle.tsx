import { useState, useRef, useEffect, useCallback } from 'react';
import type { GameComponentProps } from '../../types';
import { parseCommands, parseWithMapping, validateBrackets, executeAll, type TurtleState } from './logic';
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
  const [sourceMap, setSourceMap] = useState<number[]>([]);
  const [originalInput, setOriginalInput] = useState('');
  const [flickerKey, setFlickerKey] = useState(0);
  const startTime = useRef(Date.now());
  const intervalRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const onGameEndRef = useRef(onGameEnd);
  onGameEndRef.current = onGameEnd;

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
    onGameEndRef.current({ winner: 'player', durationMs: Date.now() - startTime.current });
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  function handleGo() {
    const { commands, sourceMap: sm } = parseWithMapping(commandInput);
    if (commands.length === 0) return;
    const fullTrace = executeAll(commands, gridSize);
    setSourceMap(sm);
    setOriginalInput(commandInput);
    setTrace(fullTrace);
    setCurrentStep(0);
    setFlickerKey(0);
    setPhase('animating');
    startTime.current = Date.now();
    endedRef.current = false;
  }

  useEffect(() => {
    if (phase !== 'animating' || trace.length === 0) return;
    if (currentStep >= trace.length - 1) {
      finishGame();
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, trace.length - 1));
      setFlickerKey((k) => k + 1);
    }, 1000);
    return clearTimer;
  }, [phase, trace.length, clearTimer, finishGame, currentStep]);

  function handleSkip() {
    setCurrentStep(trace.length - 1);
    finishGame();
  }

  const cellSize = Math.min(36, 400 / gridSize);
  const bracketError = commandInput ? validateBrackets(commandInput) : null;
  const parsed = !bracketError ? parseCommands(commandInput) : [];
  const goDisabled = parsed.length === 0 || !!bracketError;

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
            <label>Commands (F = Forward, L = Left, R = Right, e.g. 3F, 2[FR])</label>
            <input
              className={`${styles.commandInput} ${bracketError ? styles.commandInputError : ''}`}
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="e.g. 3F2[LF] or FFRFLFF"
              onKeyDown={(e) => e.key === 'Enter' && !goDisabled && handleGo()}
            />
            {bracketError && (
              <span className={styles.errorText}>{bracketError}</span>
            )}
          </div>
          <button
            className={styles.goButton}
            onClick={handleGo}
            disabled={goDisabled}
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
                {originalInput.split('').map((ch, i) => {
                  const activeSourceIdx = sourceMap[currentStep];
                  const isActive = i === activeSourceIdx;
                  const isFlicker = isActive && currentStep > 0 && sourceMap[currentStep - 1] === activeSourceIdx;
                  return (
                    <span
                      key={isFlicker ? `${i}-${flickerKey}` : i}
                      className={
                        isActive
                          ? `${styles.activeCommand} ${isFlicker ? styles.flickerCommand : ''}`
                          : ''
                      }
                    >
                      {ch}
                    </span>
                  );
                })}
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

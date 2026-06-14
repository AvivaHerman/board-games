export type Direction = 'N' | 'E' | 'S' | 'W';
export type Command = 'F' | 'L' | 'R';

export interface TurtleState {
  x: number;
  y: number;
  direction: Direction;
}

export function parseCommands(input: string): Command[] {
  return input
    .toUpperCase()
    .split('')
    .filter((c): c is Command => c === 'F' || c === 'L' || c === 'R');
}

export function rotateLeft(dir: Direction): Direction {
  const map: Record<Direction, Direction> = { N: 'W', W: 'S', S: 'E', E: 'N' };
  return map[dir];
}

export function rotateRight(dir: Direction): Direction {
  const map: Record<Direction, Direction> = { N: 'E', E: 'S', S: 'W', W: 'N' };
  return map[dir];
}

export function moveForward(state: TurtleState, gridSize: number): TurtleState {
  let { x, y } = state;
  switch (state.direction) {
    case 'N': y = Math.min(y + 1, gridSize); break;
    case 'S': y = Math.max(y - 1, 1); break;
    case 'E': x = Math.min(x + 1, gridSize); break;
    case 'W': x = Math.max(x - 1, 1); break;
  }
  return { x, y, direction: state.direction };
}

export function executeStep(state: TurtleState, command: Command, gridSize: number): TurtleState {
  switch (command) {
    case 'F': return moveForward(state, gridSize);
    case 'L': return { ...state, direction: rotateLeft(state.direction) };
    case 'R': return { ...state, direction: rotateRight(state.direction) };
  }
}

export function executeAll(commands: Command[], gridSize: number): TurtleState[] {
  const initial: TurtleState = { x: 1, y: 1, direction: 'N' };
  const trace: TurtleState[] = [initial];
  let current = initial;
  for (const cmd of commands) {
    current = executeStep(current, cmd, gridSize);
    trace.push(current);
  }
  return trace;
}

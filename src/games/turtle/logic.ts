export type Direction = 'N' | 'E' | 'S' | 'W';
export type Command = 'F' | 'L' | 'R';

export interface TurtleState {
  x: number;
  y: number;
  direction: Direction;
}

export function validateBrackets(input: string): string | null {
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '[') depth++;
    else if (input[i] === ']') {
      depth--;
      if (depth < 0) return 'Unexpected closing bracket at position ' + (i + 1);
    }
  }
  if (depth > 0) return 'Missing closing bracket' + (depth > 1 ? `s (${depth} open)` : '');
  return null;
}

export interface ParseResult {
  commands: Command[];
  sourceMap: number[];
}

export function parseCommands(input: string): Command[] {
  return parseWithMapping(input).commands;
}

export function parseWithMapping(input: string): ParseResult {
  const upper = input.toUpperCase();
  const commands: Command[] = [];
  const sourceMap: number[] = [];
  parse(upper, 0, commands, sourceMap);
  return { commands, sourceMap };
}

function parse(input: string, start: number, out: Command[], map: number[]): number {
  let i = start;
  while (i < input.length) {
    const ch = input[i];
    if (ch === ']') return i + 1;
    if (ch === 'F' || ch === 'L' || ch === 'R') {
      out.push(ch);
      map.push(i);
      i++;
    } else if (ch >= '0' && ch <= '9') {
      let numStr = '';
      while (i < input.length && input[i] >= '0' && input[i] <= '9') {
        numStr += input[i];
        i++;
      }
      const count = parseInt(numStr, 10);
      if (i < input.length && input[i] === '[') {
        const segment: Command[] = [];
        const segmentMap: number[] = [];
        i = parse(input, i + 1, segment, segmentMap);
        for (let r = 0; r < count; r++) {
          out.push(...segment);
          map.push(...segmentMap);
        }
      } else if (i < input.length && (input[i] === 'F' || input[i] === 'L' || input[i] === 'R')) {
        for (let r = 0; r < count; r++) {
          out.push(input[i] as Command);
          map.push(i);
        }
        i++;
      }
    } else {
      i++;
    }
  }
  return i;
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

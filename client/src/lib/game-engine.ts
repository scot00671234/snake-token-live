interface GamePosition {
  x: number;
  y: number;
}

interface GameCallbacks {
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  onMove: (direction: string) => void;
}

export class SnakeGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameCallbacks;
  
  private snake: GamePosition[] = [{ x: 10, y: 10 }];
  private food: GamePosition = { x: 15, y: 15 };
  private direction: string = 'right';
  private nextDirection: string = 'right';
  private score: number = 0;
  private level: number = 1;
  private isRunning: boolean = false;
  private gameLoopId: number | null = null;
  
  private readonly GRID_SIZE = 20;
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 600;
  private readonly GRID_WIDTH = this.CANVAS_WIDTH / this.GRID_SIZE;
  private readonly GRID_HEIGHT = this.CANVAS_HEIGHT / this.GRID_SIZE;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.callbacks = callbacks;
    
    this.initializeGame();
  }

  private initializeGame() {
    this.snake = [{ x: 10, y: 10 }];
    this.food = this.generateFood();
    this.direction = 'right';
    this.nextDirection = 'right';
    this.score = 0;
    this.level = 1;
    this.isRunning = false;
  }

  private generateFood(): GamePosition {
    let newFood: GamePosition;
    do {
      newFood = {
        x: Math.floor(Math.random() * this.GRID_WIDTH),
        y: Math.floor(Math.random() * this.GRID_HEIGHT)
      };
    } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
  }

  public setDirection(newDirection: string) {
    // Prevent reversing into the snake's body
    const opposites: { [key: string]: string } = {
      'up': 'down',
      'down': 'up',
      'left': 'right',
      'right': 'left'
    };

    if (opposites[newDirection] !== this.direction) {
      this.nextDirection = newDirection;
      this.callbacks.onMove(newDirection);
    }
  }

  private update() {
    if (!this.isRunning) return;

    // Update direction
    this.direction = this.nextDirection;

    // Calculate new head position
    const head = { ...this.snake[0] };
    switch (this.direction) {
      case 'up': head.y -= 1; break;
      case 'down': head.y += 1; break;
      case 'left': head.x -= 1; break;
      case 'right': head.x += 1; break;
    }

    // Check wall collision
    if (head.x < 0 || head.x >= this.GRID_WIDTH || head.y < 0 || head.y >= this.GRID_HEIGHT) {
      this.gameOver();
      return;
    }

    // Check self collision
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.gameOver();
      return;
    }

    // Add new head
    this.snake.unshift(head);

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10 * this.level;
      this.callbacks.onScoreUpdate(this.score);
      
      // Level up every 5 food items
      if (this.snake.length % 5 === 0) {
        this.level++;
      }
      
      this.food = this.generateFood();
    } else {
      // Remove tail if no food eaten
      this.snake.pop();
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0f';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // Draw grid
    this.ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x <= this.CANVAS_WIDTH; x += this.GRID_SIZE) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.CANVAS_HEIGHT);
      this.ctx.stroke();
    }
    
    for (let y = 0; y <= this.CANVAS_HEIGHT; y += this.GRID_SIZE) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.CANVAS_WIDTH, y);
      this.ctx.stroke();
    }

    // Draw snake
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        this.ctx.fillStyle = '#00ff41';
        this.ctx.shadowColor = '#00ff41';
        this.ctx.shadowBlur = 10;
      } else {
        // Body
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.shadowBlur = 5;
      }
      
      this.ctx.fillRect(
        segment.x * this.GRID_SIZE + 1,
        segment.y * this.GRID_SIZE + 1,
        this.GRID_SIZE - 2,
        this.GRID_SIZE - 2
      );
    });

    // Draw food
    this.ctx.fillStyle = '#ff6b6b';
    this.ctx.shadowColor = '#ff6b6b';
    this.ctx.shadowBlur = 15;
    this.ctx.fillRect(
      this.food.x * this.GRID_SIZE + 2,
      this.food.y * this.GRID_SIZE + 2,
      this.GRID_SIZE - 4,
      this.GRID_SIZE - 4
    );

    // Reset shadow
    this.ctx.shadowBlur = 0;

    // Draw score and level
    this.ctx.fillStyle = '#00ff41';
    this.ctx.font = 'bold 16px JetBrains Mono, monospace';
    this.ctx.fillText(`Score: ${this.score}`, 20, 30);
    this.ctx.fillText(`Level: ${this.level}`, 20, 55);
    this.ctx.fillText(`Length: ${this.snake.length}`, 20, 80);
  }

  private runGameLoop = () => {
    this.update();
    this.render();
    
    if (this.isRunning) {
      // Increase speed with level
      const speed = Math.max(100, 300 - (this.level - 1) * 20);
      this.gameLoopId = window.setTimeout(this.runGameLoop, speed);
    }
  };

  private gameOver() {
    this.isRunning = false;
    if (this.gameLoopId) {
      clearTimeout(this.gameLoopId);
      this.gameLoopId = null;
    }
    
    // Draw game over screen
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    this.ctx.fillStyle = '#ff6b6b';
    this.ctx.font = 'bold 48px Orbitron, monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 50);
    
    this.ctx.fillStyle = '#00ff41';
    this.ctx.font = 'bold 24px JetBrains Mono, monospace';
    this.ctx.fillText(`Final Score: ${this.score}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 20);
    this.ctx.fillText(`Level Reached: ${this.level}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 50);
    
    this.ctx.textAlign = 'left';
    
    this.callbacks.onGameOver(this.score);
  }

  public start() {
    this.initializeGame();
    this.isRunning = true;
    this.runGameLoop();
  }

  public stop() {
    this.isRunning = false;
    if (this.gameLoopId) {
      clearTimeout(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  public getScore(): number {
    return this.score;
  }

  public getLevel(): number {
    return this.level;
  }

  public isGameRunning(): boolean {
    return this.isRunning;
  }
}

const GRAVITY = 0.6
const JUMP_FORCE = -12
const GROUND_HEIGHT = 80
const PLAYER_SIZE = 56
const OBSTACLE_WIDTH = 36
const OBSTACLE_MIN_HEIGHT = 40
const OBSTACLE_MAX_HEIGHT = 80
const COIN_SIZE = 24
const INITIAL_SPEED = 4
const SPEED_INCREMENT = 0.0008
const OBSTACLE_INTERVAL_MIN = 80
const OBSTACLE_INTERVAL_MAX = 160
const COIN_INTERVAL_MIN = 60
const COIN_INTERVAL_MAX = 120

interface Player {
  x: number
  y: number
  vy: number
  width: number
  height: number
  grounded: boolean
  rotation: number
}

interface Obstacle {
  x: number
  y: number
  width: number
  height: number
}

interface Coin {
  x: number
  y: number
  size: number
  collected: boolean
  bobOffset: number
}

interface Cloud {
  x: number
  y: number
  width: number
  speed: number
}

export type GameState = 'ready' | 'playing' | 'gameover'

export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private player: Player
  private obstacles: Obstacle[] = []
  private coins: Coin[] = []
  private clouds: Cloud[] = []
  private score = 0
  private coinScore = 0
  private speed = INITIAL_SPEED
  private frameCount = 0
  private nextObstacleIn = 100
  private nextCoinIn = 80
  private animationId = 0
  private mascotImg: HTMLImageElement | null = null
  private state: GameState = 'ready'
  private onStateChange: (state: GameState, score: number) => void
  private groundOffset = 0
  private highScore = 0

  constructor(
    canvas: HTMLCanvasElement,
    onStateChange: (state: GameState, score: number) => void,
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.onStateChange = onStateChange
    this.player = this.createPlayer()
    this.loadHighScore()
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('mascot-game-highscore')
      if (saved) this.highScore = parseInt(saved, 10)
    } catch {
      /* ignore */
    }
  }

  private saveHighScore() {
    try {
      localStorage.setItem('mascot-game-highscore', String(this.highScore))
    } catch {
      /* ignore */
    }
  }

  private createPlayer(): Player {
    return {
      x: 60,
      y: 0,
      vy: 0,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      grounded: true,
      rotation: 0,
    }
  }

  private initClouds() {
    const w = this.canvasW
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * w,
        y: 30 + Math.random() * (this.canvasH * 0.35),
        width: 50 + Math.random() * 60,
        speed: 0.3 + Math.random() * 0.5,
      })
    }
  }

  private get groundY(): number {
    return this.canvasH - GROUND_HEIGHT
  }

  loadMascot(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.mascotImg = img
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  resize() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
    this.player.y = this.groundY - this.player.height
    if (this.clouds.length === 0) {
      this.initClouds()
    }
  }

  jump() {
    if (this.state === 'ready') {
      this.state = 'playing'
      this.onStateChange('playing', 0)
      this.player.vy = JUMP_FORCE
      this.player.grounded = false
      return
    }
    if (this.state !== 'playing') return
    if (this.player.grounded) {
      this.player.vy = JUMP_FORCE
      this.player.grounded = false
    }
  }

  reset() {
    this.player = this.createPlayer()
    this.player.y = this.groundY - this.player.height
    this.obstacles = []
    this.coins = []
    this.score = 0
    this.coinScore = 0
    this.speed = INITIAL_SPEED
    this.frameCount = 0
    this.nextObstacleIn = 100
    this.nextCoinIn = 80
    this.state = 'ready'
    this.groundOffset = 0
    this.onStateChange('ready', 0)
  }

  start() {
    const loop = () => {
      this.update()
      this.render()
      this.animationId = requestAnimationFrame(loop)
    }
    this.animationId = requestAnimationFrame(loop)
  }

  stop() {
    cancelAnimationFrame(this.animationId)
  }

  getState(): GameState {
    return this.state
  }

  getScore(): number {
    return this.score + this.coinScore * 10
  }

  getHighScore(): number {
    return this.highScore
  }

  private update() {
    if (this.state !== 'playing') return

    this.frameCount++
    this.speed = INITIAL_SPEED + this.frameCount * SPEED_INCREMENT
    this.score = Math.floor(this.frameCount / 6)
    this.groundOffset = (this.groundOffset + this.speed) % 24

    // Player physics
    this.player.vy += GRAVITY
    this.player.y += this.player.vy

    const floor = this.groundY - this.player.height
    if (this.player.y >= floor) {
      this.player.y = floor
      this.player.vy = 0
      this.player.grounded = true
      this.player.rotation = 0
    } else {
      this.player.rotation = Math.min(this.player.vy * 2, 30)
    }

    // Spawn obstacles
    this.nextObstacleIn--
    if (this.nextObstacleIn <= 0) {
      const h = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT)
      this.obstacles.push({
        x: this.canvasW + 10,
        y: this.groundY - h,
        width: OBSTACLE_WIDTH,
        height: h,
      })
      this.nextObstacleIn = OBSTACLE_INTERVAL_MIN + Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN)
    }

    // Spawn coins
    this.nextCoinIn--
    if (this.nextCoinIn <= 0) {
      const minCoinY = this.groundY - 140
      const maxCoinY = this.groundY - 50
      this.coins.push({
        x: this.canvasW + 10,
        y: minCoinY + Math.random() * (maxCoinY - minCoinY),
        size: COIN_SIZE,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2,
      })
      this.nextCoinIn = COIN_INTERVAL_MIN + Math.random() * (COIN_INTERVAL_MAX - COIN_INTERVAL_MIN)
    }

    // Move obstacles
    for (const obs of this.obstacles) {
      obs.x -= this.speed
    }
    this.obstacles = this.obstacles.filter((o) => o.x + o.width > -10)

    // Move coins
    for (const coin of this.coins) {
      coin.x -= this.speed
    }
    this.coins = this.coins.filter((c) => c.x + c.size > -10)

    // Move clouds
    for (const cloud of this.clouds) {
      cloud.x -= cloud.speed
      if (cloud.x + cloud.width < 0) {
        cloud.x = this.canvasW + 20
        cloud.y = 30 + Math.random() * (this.canvasH * 0.35)
      }
    }

    // Collision with obstacles
    const px = this.player.x + 8
    const py = this.player.y + 8
    const pw = this.player.width - 16
    const ph = this.player.height - 8
    for (const obs of this.obstacles) {
      if (
        px < obs.x + obs.width &&
        px + pw > obs.x &&
        py < obs.y + obs.height &&
        py + ph > obs.y
      ) {
        this.gameOver()
        return
      }
    }

    // Coin collection
    for (const coin of this.coins) {
      if (coin.collected) continue
      const cx = coin.x + coin.size / 2
      const cy = coin.y + coin.size / 2
      const playerCx = this.player.x + this.player.width / 2
      const playerCy = this.player.y + this.player.height / 2
      const dist = Math.hypot(cx - playerCx, cy - playerCy)
      if (dist < (this.player.width / 2 + coin.size / 2) * 0.7) {
        coin.collected = true
        this.coinScore++
      }
    }
  }

  private get canvasW(): number {
    return this.canvas.width / (window.devicePixelRatio || 1)
  }

  private get canvasH(): number {
    return this.canvas.height / (window.devicePixelRatio || 1)
  }

  private gameOver() {
    this.state = 'gameover'
    const total = this.getScore()
    if (total > this.highScore) {
      this.highScore = total
      this.saveHighScore()
    }
    this.onStateChange('gameover', total)
  }

  private render() {
    const w = this.canvasW
    const h = this.canvasH
    const ctx = this.ctx

    ctx.clearRect(0, 0, w, h)

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY)
    skyGrad.addColorStop(0, '#87CEEB')
    skyGrad.addColorStop(1, '#E0F4FF')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, w, this.groundY)

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    for (const cloud of this.clouds) {
      this.drawCloud(cloud.x, cloud.y, cloud.width)
    }

    // Ground
    ctx.fillStyle = '#58CC02'
    ctx.fillRect(0, this.groundY, w, GROUND_HEIGHT)
    ctx.fillStyle = '#58A700'
    ctx.fillRect(0, this.groundY, w, 4)

    // Ground pattern (moving dashes)
    ctx.fillStyle = '#4DB800'
    for (let i = -24; i < w + 24; i += 24) {
      const gx = i - this.groundOffset
      ctx.fillRect(gx, this.groundY + 12, 12, 3)
      ctx.fillRect(gx + 8, this.groundY + 24, 12, 3)
    }

    // Obstacles
    for (const obs of this.obstacles) {
      // Body
      ctx.fillStyle = '#FF4B4B'
      ctx.beginPath()
      this.roundRect(obs.x, obs.y + 4, obs.width, obs.height - 4, 6)
      ctx.fill()

      // 3D border-bottom
      ctx.fillStyle = '#CC3333'
      ctx.fillRect(obs.x, obs.y + obs.height - 6, obs.width, 6)

      // Spikes on top
      ctx.fillStyle = '#FF4B4B'
      const spikeW = 10
      const spikeH = 12
      const numSpikes = Math.floor(obs.width / spikeW)
      for (let i = 0; i < numSpikes; i++) {
        const sx = obs.x + i * spikeW + spikeW / 2
        ctx.beginPath()
        ctx.moveTo(sx - spikeW / 2, obs.y + 4)
        ctx.lineTo(sx, obs.y - spikeH + 4)
        ctx.lineTo(sx + spikeW / 2, obs.y + 4)
        ctx.fill()
      }
    }

    // Coins
    for (const coin of this.coins) {
      if (coin.collected) continue
      const bob = Math.sin(this.frameCount * 0.08 + coin.bobOffset) * 4
      const cy = coin.y + bob
      ctx.fillStyle = '#FFD900'
      ctx.beginPath()
      ctx.arc(coin.x + coin.size / 2, cy + coin.size / 2, coin.size / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#E6C300'
      ctx.lineWidth = 2
      ctx.stroke()

      // Star inside
      ctx.fillStyle = '#FFF3B0'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('\u2605', coin.x + coin.size / 2, cy + coin.size / 2)
    }

    // Player
    const p = this.player
    ctx.save()
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2)
    ctx.rotate((p.rotation * Math.PI) / 180)

    if (this.mascotImg) {
      ctx.drawImage(this.mascotImg, -p.width / 2, -p.height / 2, p.width, p.height)
    } else {
      ctx.fillStyle = '#FFD900'
      ctx.beginPath()
      ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    // HUD - Score
    ctx.fillStyle = '#FFD900'
    ctx.strokeStyle = '#3c3c3c'
    ctx.lineWidth = 3
    ctx.font = '900 24px Nunito, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    const scoreText = `\u2B50 ${this.getScore()}`
    ctx.strokeText(scoreText, 16, 16)
    ctx.fillText(scoreText, 16, 16)

    // HUD - High score
    if (this.highScore > 0) {
      ctx.font = '700 14px Nunito, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 2
      const hiText = `HI ${this.highScore}`
      ctx.strokeText(hiText, 16, 46)
      ctx.fillText(hiText, 16, 46)
    }

    // Ready screen
    if (this.state === 'ready') {
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#ffffff'
      ctx.font = '900 28px Nunito, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.strokeStyle = '#3c3c3c'
      ctx.lineWidth = 3
      ctx.strokeText('Tap to Start!', w / 2, h / 2 - 30)
      ctx.fillText('Tap to Start!', w / 2, h / 2 - 30)

      ctx.font = '700 16px Nunito, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 2
      ctx.strokeText('Tap to jump over obstacles', w / 2, h / 2 + 10)
      ctx.fillText('Tap to jump over obstacles', w / 2, h / 2 + 10)
    }

    // Game over screen
    if (this.state === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, w, h)

      // Card background
      const cardW = Math.min(280, w - 40)
      const cardH = 200
      const cardX = (w - cardW) / 2
      const cardY = (h - cardH) / 2 - 20

      // Card shadow
      ctx.fillStyle = '#d4d4d4'
      this.roundRectFill(cardX, cardY + 4, cardW, cardH, 24)

      // Card
      ctx.fillStyle = '#ffffff'
      this.roundRectFill(cardX, cardY, cardW, cardH, 24)

      // Border
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 2
      ctx.beginPath()
      this.roundRect(cardX, cardY, cardW, cardH, 24)
      ctx.stroke()

      // Game Over text
      ctx.fillStyle = '#3c3c3c'
      ctx.font = '900 26px Nunito, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Game Over!', w / 2, cardY + 40)

      // Score
      ctx.fillStyle = '#FFD900'
      ctx.strokeStyle = '#E6C300'
      ctx.lineWidth = 2
      ctx.font = '900 36px Nunito, sans-serif'
      ctx.strokeText(`\u2B50 ${this.getScore()}`, w / 2, cardY + 85)
      ctx.fillText(`\u2B50 ${this.getScore()}`, w / 2, cardY + 85)

      // High score
      ctx.fillStyle = '#777777'
      ctx.font = '700 14px Nunito, sans-serif'
      ctx.fillText(`Best: ${this.highScore}`, w / 2, cardY + 118)

      // Restart hint
      ctx.fillStyle = '#58CC02'
      ctx.font = '800 18px Nunito, sans-serif'
      ctx.fillText('TAP TO PLAY AGAIN', w / 2, cardY + 165)
    }
  }

  private drawCloud(x: number, y: number, w: number) {
    const ctx = this.ctx
    const h = w * 0.5
    ctx.beginPath()
    ctx.arc(x + w * 0.3, y + h * 0.5, h * 0.4, 0, Math.PI * 2)
    ctx.arc(x + w * 0.5, y + h * 0.25, h * 0.45, 0, Math.PI * 2)
    ctx.arc(x + w * 0.7, y + h * 0.5, h * 0.35, 0, Math.PI * 2)
    ctx.fill()
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    this.ctx.moveTo(x + r, y)
    this.ctx.lineTo(x + w - r, y)
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    this.ctx.lineTo(x + w, y + h - r)
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    this.ctx.lineTo(x + r, y + h)
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    this.ctx.lineTo(x, y + r)
    this.ctx.quadraticCurveTo(x, y, x + r, y)
  }

  private roundRectFill(x: number, y: number, w: number, h: number, r: number) {
    this.ctx.beginPath()
    this.roundRect(x, y, w, h, r)
    this.ctx.fill()
  }
}

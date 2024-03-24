import { Howl } from 'howler';

type SoundFX = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'TETRIS' | 'PAUSE' | 'COUNT' | 'MOVE' | 'SOFT DROP' | 'HARD DROP' | 'ROTATE' | 'LOCK' | 'BLOCKED' | 'LEVEL UP' | 'GAME OVER' | 'PERFECT CLEAR' | 'COMBO' | 'NEW BEST SCORE' | 'BUTTON';

class Sound {
  static instance: Sound;

  music: Howl;
  soundFXs: Map<SoundFX, Howl>;

  static getInstance(): Sound {
    if (typeof Sound.instance === 'undefined') {
      Sound.instance = new Sound();
    }
    return Sound.instance;
  }

  private constructor() {
    Howler.autoUnlock = false;

    this.music = new Howl({ src: ['/tetris/audio/music.webm', '/tetris/audio/music.mp3'], format: ['webm', 'mp3'], loop: true })
    this.soundFXs = new Map([
    ['SINGLE',         new Howl({ src: ['/tetris/audio/se_game_single.webm', '/tetris/audio/se_game_single.mp3'], format: ['webm', 'mp3']})],
    ['DOUBLE',         new Howl({ src: ['/tetris/audio/se_game_double.webm', '/tetris/audio/se_game_double.mp3'], format: ['webm', 'mp3']})],
    ['TRIPLE',         new Howl({ src: ['/tetris/audio/se_game_triple.webm', '/tetris/audio/se_game_triple.mp3'], format: ['webm', 'mp3']})],
    ['TETRIS',         new Howl({ src: ['/tetris/audio/se_game_tetris.webm', '/tetris/audio/se_game_tetris.mp3'], format: ['webm', 'mp3']})],
    ['PAUSE',          new Howl({ src: ['/tetris/audio/se_game_pause.webm', '/tetris/audio/se_game_pause.mp3'], format: ['webm', 'mp3']})],
    ['COUNT',          new Howl({ src: ['/tetris/audio/se_game_count.webm', '/tetris/audio/se_game_count.mp3'], format: ['webm', 'mp3']})],
    ['MOVE',           new Howl({ src: ['/tetris/audio/se_game_move.webm', '/tetris/audio/se_game_move.mp3'], format: ['webm', 'mp3']})],
    ['SOFT DROP',      new Howl({ src: ['/tetris/audio/se_game_softdrop.webm', '/tetris/audio/se_game_softdrop.mp3'], format: ['webm', 'mp3']})],
    ['HARD DROP',      new Howl({ src: ['/tetris/audio/se_game_harddrop.webm', '/tetris/audio/se_game_harddrop.mp3'], format: ['webm', 'mp3']})],
    ['ROTATE',         new Howl({ src: ['/tetris/audio/se_game_rotate.webm', '/tetris/audio/se_game_rotate.mp3'], format: ['webm', 'mp3']})],
    ['LOCK',           new Howl({ src: ['/tetris/audio/se_game_landing.webm', '/tetris/audio/se_game_landing.mp3'], format: ['webm', 'mp3']})],
    ['BLOCKED',        new Howl({ src: ['/tetris/audio/blocked.webm', '/tetris/audio/blocked.mp3'], format: ['webm', 'mp3'], rate: 0.2 })],
    ['LEVEL UP',       new Howl({ src: ['/tetris/audio/me_game_plvup.webm', '/tetris/audio/me_game_plvup.mp3'], format: ['webm', 'mp3'] })],
    ['GAME OVER',      new Howl({ src: ['/tetris/audio/ses_sys_save.webm', '/tetris/audio/ses_sys_save.mp3'], format: ['webm', 'mp3'] })],
    ['PERFECT CLEAR',  new Howl({ src: ['/tetris/audio/se_game_perfect.webm', '/tetris/audio/se_game_perfect.mp3'], format: ['webm', 'mp3'] })],
    ['COMBO',          new Howl({ src: ['/tetris/audio/se_game_kbcomp.webm', '/tetris/audio/se_game_kbcomp.mp3'], format: ['webm', 'mp3'] })],
    ['NEW BEST SCORE', new Howl({ src: ['/tetris/audio/se_game_perfect.webm', '/tetris/audio/se_game_perfect.mp3'], format: ['webm', 'mp3'] })],
    ['BUTTON',         new Howl({ src: ['/tetris/audio/se_sys_cursor2.webm', '/tetris/audio/se_sys_cursor2.mp3'], format: ['webm', 'mp3'] })],
    ])
  }

  playMusic(): void {
    this.music.play();
  }

  stopMusic(): void {
    this.music.stop();
  }

  setMusicRate(rate: number): void {
    this.music.rate(rate);
  }

  setMusicVolume(volume: number): void {
    this.music.volume(volume);
  }

  musicVolume(): number {
    return this.music.volume();
  }

  playSoundFX(audio: SoundFX): void {
    (this.soundFXs.get(audio) as Howl).play();
  }

  setSoundFXVolume(volume: number): void {
    this.soundFXs.forEach(soundFx => {
      soundFx.volume(volume);
    });
  }

  soundFXVolume(): number {
    return (this.soundFXs.get('COUNT') as Howl).volume();
  }
}

export { Sound };
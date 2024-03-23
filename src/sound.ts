import { Howl } from 'howler';

type SoundFX = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'TETRIS' | 'PAUSE' | 'COUNT' | 'MOVE' | 'SOFT DROP' | 'HARD DROP' | 'ROTATE' | 'LOCK' | 'BLOCKED' | 'LEVEL UP' | 'GAME OVER' | 'PERFECT CLEAR' | 'COMBO' | 'BUTTON';

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
    this.music = new Howl({ src: ['/tetris/audio/music.wav'], loop: true })
    this.soundFXs = new Map([
      ['SINGLE',         new Howl({ src: ['/tetris/audio/se_game_single.wav']})],
      ['DOUBLE',         new Howl({ src: ['/tetris/audio/se_game_double.wav']})],
      ['TRIPLE',         new Howl({ src: ['/tetris/audio/se_game_triple.wav']})],
      ['TETRIS',         new Howl({ src: ['/tetris/audio/se_game_tetris.wav']})],
      ['PAUSE',          new Howl({ src: ['/tetris/audio/se_game_pause.wav']})],
      ['COUNT',          new Howl({ src: ['/tetris/audio/se_game_count.wav']})],
      ['MOVE',           new Howl({ src: ['/tetris/audio/se_game_move.wav']})],
      ['SOFT DROP',      new Howl({ src: ['/tetris/audio/se_game_softdrop.wav']})],
      ['HARD DROP',      new Howl({ src: ['/tetris/audio/se_game_harddrop.wav']})],
      ['ROTATE',         new Howl({ src: ['/tetris/audio/se_game_rotate.wav']})],
      ['LOCK',           new Howl({ src: ['/tetris/audio/se_game_landing.wav']})],
      ['BLOCKED',        new Howl({ src: ['/tetris/audio/blocked.wav'], rate: 0.2 })],
      ['LEVEL UP',       new Howl({ src: ['/tetris/audio/me_game_plvup.wav'] })],
      ['GAME OVER',      new Howl({ src: ['/tetris/audio/ses_sys_save.wav'] })],
      ['PERFECT CLEAR',  new Howl({ src: ['/tetris/audio/se_game_perfect.wav'] })],
      ['COMBO',          new Howl({ src: ['/tetris/audio/se_game_kbcomp.wav'] })],
      ['BUTTON',         new Howl({ src: ['/tetris/audio/se_sys_cursor2.wav'] })],
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
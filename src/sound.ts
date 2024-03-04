import { Howl } from 'howler';

type Audio = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'TETRIS' | 'PAUSE' | 'COUNT' | 'MOVE' | 'SOFT DROP' | 'ROTATE' | 'LOCK' | 'BLOCKED' | 'LEVEL UP' | 'GAME OVER' | 'PERFECT CLEAR' | 'COMBO';

class Sound {
  static instance: Sound;

  sounds: Map<Audio, Howl>;

  static getInstance(): Sound {
    if (typeof Sound.instance === 'undefined') {
      Sound.instance = new Sound();
    }
    return Sound.instance;
  }

  private constructor() {
    this.sounds = new Map([
      ['SINGLE',         new Howl({ src: ['/tetris/audio/se_game_single.wav']})],
      ['DOUBLE',         new Howl({ src: ['/tetris/audio/se_game_double.wav']})],
      ['TRIPLE',         new Howl({ src: ['/tetris/audio/se_game_triple.wav']})],
      ['TETRIS',         new Howl({ src: ['/tetris/audio/se_game_tetris.wav']})],
      ['PAUSE',          new Howl({ src: ['/tetris/audio/se_game_pause.wav']})],
      ['COUNT',          new Howl({ src: ['/tetris/audio/se_game_count.wav']})],
      ['MOVE',           new Howl({ src: ['/tetris/audio/se_game_move.wav']})],
      ['SOFT DROP',      new Howl({ src: ['/tetris/audio/se_game_softdrop.wav']})],
      ['ROTATE',         new Howl({ src: ['/tetris/audio/se_game_rotate.wav']})],
      ['LOCK',           new Howl({ src: ['/tetris/audio/se_game_landing.wav']})],
      ['BLOCKED',        new Howl({ src: ['/tetris/audio/se_game_landing.wav'], volume: 0.3, rate: 0.2 })],
      ['LEVEL UP',       new Howl({ src: ['/tetris/audio/me_game_plvup.wav'] })],
      ['GAME OVER',      new Howl({ src: ['/tetris/audio/ses_sys_save.wav'] })],
      ['PERFECT CLEAR',  new Howl({ src: ['/tetris/audio/se_game_perfect.wav'] })],
      ['COMBO',          new Howl({ src: ['/tetris/audio/se_game_kbcomp.wav'] })],
    ])
  }

  play(audio: Audio): void {
    (this.sounds.get(audio) as Howl).play();
  }
}

export { Sound };
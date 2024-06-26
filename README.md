# Tetris

## Tetris Guideline

- [testris.wiki](https://tetris.wiki/Tetris_Guideline)
- [harddrop.com](https://harddrop.com/wiki/Tetris_Guideline)
- [tetris.fandom.com](https://tetris.fandom.com/wiki/Tetris_Guideline)
 
## UI Layout References

- [Tetris n-blox](https://media.recordsetter.com/b4f5b069-0a97-4fcb-b30b-9bbf54fe1d92_TETRIS_xl.png)
- [Game Boy Tetris](https://upload.wikimedia.org/wikipedia/en/4/4a/GB_Tetris.png)
- [Retro (Unknown)](docs%2Freference.png)

## Music
- [Korobeeiniki](https://en.wikipedia.org/wiki/Korobeiniki)
- [Custom music using Song maker](https://musiclab.chromeexperiments.com/Song-Maker/song/6348087999201280)
 
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

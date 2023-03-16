import { defineStore } from 'pinia'

export default defineStore('storeApp', {
  state () {
    return {
      themeType: 'light',
      bgm: '',
      score: 0,
    }
  },
  getters: {
     getThemeType: (state) => state.themeType,
     getBgm: (state) => state.bgm,
     getScore: (state) => state.score
  },
  actions: {
     setThemeType(themeType){
        this.themeType = themeType
     },
     setBgm(bgm){
        this.bgm = bgm
     },
     setScore(score){
        this.score = score
     }
  },
  persist: {
    enabled: true,
    strategies: [
      { storage: sessionStorage, paths: ['themeType'] },
      { storage: sessionStorage, paths: ['bgm'] }
    ],
  },
})

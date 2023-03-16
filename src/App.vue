<template>
  <div class="score-panel">{{ scoreSum }}</div>
  <div class="cl-start-shade" v-if="isStart === 0">
     <div class="cl-start-main"> 
          <div class="cl-title"> jump jump jump </div>
          <div class="cl-button" @click="handleClickStart">start</div>
     </div>
  </div>
  <!-- <div class="cl-restart" v-if="isFail === 0"> -->
    <div class="cl-restart" v-if="isFail === 1">
          <div class="cl-panel-score"> {{ scoreSum }} </div>
          <a class="cl-button" @click="handleClickRestart">
            <span>Restart </span>
          </a>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import Game from './utils/game'

import Store from './store/index.js'

const Pinia  = Store()
const scoreSum = computed(() => Pinia.useAppStore.getScore)
const isStart = ref(0)
const isFail = ref(0)
const bgm = new Audio('./audio/bgm.mp3');
const fallMusic = new Audio('./audio/fall.mp3');
onMounted (()=>{
  var game = new Game()
  game.init()
  game.addSuccessFn(success)
  game.addFailedFn(failed)

  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  })
})

const success = (score) => {
  Pinia.useAppStore.setScore(score)
}

const failed = () => {
  isFail.value = 1
  fallMusic.volume = 0.75;
  fallMusic.loop = false;
  fallMusic.play()
  bgm.pause()
}

const handleClickStart = () => {
  isStart.value = 1
  audioBgm()
}

const audioBgm = () => {
	bgm.volume = 0.5
	bgm.play();
  bgm.loop = true;
  Pinia.useAppStore.setBgm(bgm)
}

const handleClickRestart = () => {

}

</script>
<style lang="stylus" scoped>
  @font-face {
      font-family: myFirstFont;
      src: url('./assets/font/digital_number.ttf')
  }
.score-panel {
    position: absolute;
    display: inline-block;
    left: 1em;
    top: 1.5em;
    font-size: 26px;
    font-family: myFirstFont;
}
.cl-start-shade {
  position: fixed;
  top: 0;
  width:100vw;
  height:100vh;
  z-index: 999;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  .cl-start-main{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .cl-title {
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 30px;
  }
  .cl-button {
    font-size: 26px;
    font-weight: 600;
    width: 150px;
    height: 60px;
    line-height: 60px;
    color: #ffffff;
    background: #232323;
    border-radius: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}


.cl-restart{
  display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	position: fixed;
	width: 100%;
	height: 100%;
	background: rgba(0,0,0,0.4);
  z-index: 9999;
  .cl-panel-score {
    font-size: 77px;
    font-family: myFirstFont;
    color: #ffffff
    margin-bottom: 77px
  }
  .cl-button {
    font-size: 26px;
    font-weight: 600;
    width: 150px;
    height: 60px;
    line-height: 60px;
    color: #ffffff;
    background: #232323;
    border-radius: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.content{
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 500px;
	height: 500px;
	border-radius: 20px;
	background: rgba(0,0,0,0.4);
	border: 5px solid rgba(255,255,255,0.05);

}
.score-container{
	color: #ffffff;
	/* color: #232323; */
	text-align: center;
}
.title{
  font-size: 20px;
  font-weight: bold;
  /* color: rgba(255,255,255,0.6); */
}
.score{
	font-size: 100px;
	font-weight: bold;
	margin-top: 20px;
}
button.restart{
	width: 200px;
	height: 40px;
	border-radius: 20px;
	background: white;
	border: none;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
}
button.restart:hover{
	color:#232323;
}
.info{
  margin: 20px 0;
  position: absolute;
  text-align: center;
  width:100%;
  color: rgba(255,255,255,0.2);
}
.info a{
  /* display: block; */
  font-size: 16px;
  line-height: 28px;
  color: rgba(255,255,255,0.2);
	/* color: #232323; */
  text-decoration: none;
}
a.title{
  font-size: 20px;
  font-weight: bold;
}
.score-gaming{
	margin-top: 10px;
	color: rgba(255,255,255,1);
	font-size: 16px;
}
</style>

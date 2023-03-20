<template>
  <div class="score-panel">{{ scoreSum }}</div>
  <div class="cl-start-shade" v-if="isStart === 0">
     <div class="cl-start-main"> 
          <div class="cl-title"> jump</div>
          <swiper
            :effect="'cards'"
            :grabCursor="true"
            :modules="EffectCards"
            @swiper="onSwiper"
            @slideChange="onSlideChange"
            class="mySwiper"
          >
            <swiper-slide>
              <img src="@/assets/images/1.png" />
            </swiper-slide>
            <swiper-slide>
              <img src="@/assets/images/2.png" />
            </swiper-slide>
            <swiper-slide>
              <img src="@/assets/images/3.png" />
            </swiper-slide>
          </swiper>
          <div class="cl-button" @click="handleClickStart">start</div>
          <!-- <div class="cl-button" @click="handleClickTest">start</div> -->
     </div>
  </div>
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
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCards } from 'swiper';
import 'swiper/css/effect-cards';

// Import Swiper styles
import 'swiper/css';
const Pinia  = Store()
const scoreSum = computed(() => Pinia.useAppStore.getScore)
const isStart = ref(0)
const isFail = ref(0)
const glbModelPath = ref("")
const bgm = new Audio('./audio/bgm.mp3');
const fallMusic = new Audio('./audio/fall.mp3');
let game 
onMounted (()=>{
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  })
})

const onSwiper = (swiper) => {
   glbModelPath.value = './1.glb'
};

const onSlideChange = (e) => {
  let pageIndex = e.activeIndex;
   switch (pageIndex) {
      case 0:
        glbModelPath.value = './1.glb'
        break
      case 1:
        glbModelPath.value = './2.glb'
        break
      case 2:
        glbModelPath.value = './3.glb'
        break
      default:
        glbModelPath.value = './1.glb'
        break
   }
};
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
  console.log(glbModelPath.value);
  game = new Game(glbModelPath.value)
  game.init()
  game.addSuccessFn(success)
  game.addFailedFn(failed)
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
  game.restart()
  isFail.value = 0
  bgm.play();
}

const handleClickTest = () => {
  // game.test()
  // console.log(game)
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
    margin-top: 30px
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


.swiper {
  width: 240px;
  height: 320px;
}

.swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  img {
    width: 200px
  }
}

.swiper-slide:nth-child(1n) {
  background-color: rgb(0, 140, 255);
}

.swiper-slide:nth-child(2n) {
  background-color: rgb(10, 184, 111);
}

.swiper-slide:nth-child(3n) {
  background-color: rgb(118, 163, 12);
}
</style>

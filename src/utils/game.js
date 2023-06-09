import * as THREE from 'three'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import Snow from "./snow";
import { IS_HELPER, BACKGROUND, GROUND, FALLING_SPEED, CUBE_COLOR, CUBE_WIDTH, CUBE_HEIGHT, CUBE_DEEP, JUMPER_WIDTH } from "../config/settings";
// import snowImg from "../textures/snow.png"
export default class Game  {
  constructor(modelPath) {
      this.config = {
          isMobile: false,
      }
      this.modelPath = modelPath
      this.score = 0
      this.size = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      // 场景
      this.scene = new THREE.Scene()
      this.snow = new Snow(10000, 100, './textures/snow.png')
      this.scene.add(this.snow.particle)
      // 相机
      this.camera = new THREE.OrthographicCamera(this.size.width / -80, this.size.width / 80, this.size.height / 80, this.size.height / -80, 0, 5000)
      // 相机坐标位置配置
      this.cameraPos = {
         current: new THREE.Vector3(0, 0, 0), // 摄像机当前的坐标
         next: new THREE.Vector3() // 摄像机即将要移到的位置
      }
      // 渲染器
      this.renderer = new THREE.WebGLRenderer({antialias: true})
      this.renderer.outputEncoding = THREE.sRGBEncoding
      // 人物模型
      this.model = null
      const bgTextureLoader = new THREE.TextureLoader();
      const bgTexture = bgTextureLoader.load('./textures/bg2.jpg');
      bgTexture.wrapS = bgTexture.wrapT = THREE.RepeatWrapping; // 指定重复方向为两个方向
      bgTexture.repeat.set(50, 50); 
      
      var planceGeometry = new THREE.PlaneGeometry(this.size.width, this.size.height);   
      var planeMaterial = new THREE.MeshLambertMaterial({ 
            map:bgTexture
       });  
      var plane = new THREE.Mesh(planceGeometry, planeMaterial);    // 把这2个对象合并到一个名为plane(平面)的Mesh(网格)对象中
      plane.receiveShadow = true;    // 平面接收阴影
      plane.rotation.x = -0.5*Math.PI;    // 绕x轴旋转90度
      plane.position.x = 0;    // 平面坐标位置
      plane.position.y = -1;
      plane.position.z = 0;
      this.plane = plane;
      this.scene.add(this.plane);    // 将平面添加到场景
      this.scene.background = new THREE.Color(0x0000ff)

      this.cubes = [] // 方块数组
      this.cubeStat = {
        nextDir: '' // 下一个方块相对于当前方块的方向: 'left' 或 'right'
      }
      this.jumperStat = {
        ready: false, // 鼠标按完没有
        xSpeed: 0, // xSpeed根据鼠标按的时间进行赋值
        ySpeed: 0  // ySpeed根据鼠标按的时间进行赋值
      }
      this.falledStat = {
        location: -1, // jumper所在的位置
        distance: 0 // jumper和最近方块的距离
      }
      this.fallingStat = {
        speed: 0.2, // 游戏失败后垂直方向上的掉落速度
        end: false // 掉到地面没有
      }
      this.combo = 0; // 连续调到中心的次数，起始为0
  }

  init() {
        this._checkUserAgent() // 检测是否移动端
        this._setCamera() // 设置摄像机位置
        this._setRenderer() // 设置渲染器参数
        this._setLight() // 设置光照
        this._createCube() // 加一个方块
        this._createCube() // 再加一个方块
        this._createJumper() // 加入游戏者jumper
        this._updateCamera() // 更新相机坐标
    
        if(IS_HELPER){ 
          this._createHelpers();
        }
    
        var self = this
        var mouseEvents = (self.config.isMobile) ?
        {
          down: 'touchstart',
          up: 'touchend',
        }
        :
        {
          down: 'mousedown',
          up: 'mouseup',
        }
        // 事件绑定到canvas中
        var canvas = document.querySelector('canvas')
        canvas.addEventListener(mouseEvents.down, function () {
      
           self._handleMousedown()
        })
        // 监听鼠标松开的事件
        canvas.addEventListener(mouseEvents.up, function (evt) {
          // console.log('mouseup');
          self._handleMouseup()
        })
        // 监听窗口变化的事件
        window.addEventListener('resize', function () {
          self._handleWindowResize()
        })
    }
      // 游戏失败重新开始的初始化配置
      restart () {
        this.score = 0
        this.cameraPos = {
          current: new THREE.Vector3(0, 0, 0),
          next: new THREE.Vector3()
        }
        this.fallingStat = {
          speed: 0.2,
          end: false
        }
        // 删除所有方块
        var length = this.cubes.length
        for(var i=0; i < length; i++){
          this.scene.remove(this.cubes.pop())
        }
        // 删除jumper
        this.scene.remove(this.jumper)
        // 显示的分数设为 0
        this.successCallback(this.score)
        this._createCube()
        this._createCube()
        this._createJumper()
        this._updateCamera()
      }
      // 游戏成功的执行函数, 外部传入
      addSuccessFn (fn) {
        this.successCallback = fn
      }
      // 游戏失败的执行函数, 外部传入
      addFailedFn (fn) {
        this.failedCallback = fn
      }
      // 检测是否手机端
      _checkUserAgent () {
        var n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i)){
          this.config.isMobile = true
        }
      }
      // THREE.js辅助工具
      _createHelpers () {
        // 法向量辅助线
        var axesHelper = new THREE.AxesHelper(10)
        this.scene.add(axesHelper);
    
        // 平行光辅助线
        var helper = new THREE.DirectionalLightHelper(this.directionalLight, 5 );
        this.scene.add( helper );
      }
      // 窗口缩放绑定的函数
      _handleWindowResize () {
        this._setSize()
        this.camera.left = this.size.width / -80
        this.camera.right = this.size.width / 80
        this.camera.top = this.size.height / 80
        this.camera.bottom = this.size.height / -80
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.size.width, this.size.height)
        this._render()
      }
      /**
       *鼠标按下或触摸开始绑定的函数
       *根据鼠标按下的时间来给 xSpeed 和 ySpeed 赋值
       *@return {Number} this.jumperStat.xSpeed 水平方向上的速度
       *@return {Number} this.jumperStat.ySpeed 垂直方向上的速度
      **/
      _handleMousedown () {
        var self = this
        function act() {
        
        // if (!self.jumperStat.ready && self.jumper.scale.y > 0.02) {
          // 以jumperBody蓄力一半为最大值
          if (!self.jumperStat.ready  &&  self.jumper.scale.y >= 0.5) {
       
            self.jumper.scale.y -= 0.01  // jumper随按压时间降低高度，即减小jumper.scale.y值
            self.jumperStat.xSpeed += 0.004
            self.jumperStat.ySpeed += 0.008
    
            // self.jumperStat.yTimes = (1 - self.jumperBody.scale.y) / 0.01; // 计算倍数, 用于jumper在y轴的旋转
            self.jumperStat.yTimes = (1 - self.jumper.scale.y) / 0.01; // 计算倍数, 用于jumper在y轴的旋转
            // console.log( self.jumperBody.scale.y, self.jumperStat.yTimes );
    
            self.mouseDownFrameHandler =  requestAnimationFrame(act);
          }
          self._render(self.scene, self.camera);
        }
        act();
      }
      // 鼠标松开或触摸结束绑定的函数
      _handleMouseup () {
        var self = this
        // 标记鼠标已经松开
        self.jumperStat.ready = true;
        cancelAnimationFrame(self.mouseDownFrameHandler);
        var frameHandler;
    
        function act() {
          // 判断jumper是在方块水平面之上，是的话说明需要继续运动
          // if (self.jumper.position.y >= 1) { // 此处不应该只判断jumper的位置，而是应该判断jumper的y速度
          if (self.jumperStat.ySpeed > 0 || self.jumper.position.y >= 1) {
            // jumper根据下一个方块的位置来确定水平运动方向
    
            var jumperRotateBase = self.jumperStat.yTimes / 2;
    
            if (self.cubeStat.nextDir === 'left') {
              self.jumper.position.x -= self.jumperStat.xSpeed
              // 在20倍以上的程度才有翻转效果
              // if(self.jumperStat.yTimes > 30){
              //   // 小人起跳翻转
              //   if(self.jumper.rotation.z < Math.PI*2){
              //       self.jumper.rotation.z += Math.PI / jumperRotateBase;
              //   }
              //   // 到达最高点
              //   if(self.jumperStat.ySpeed == 0){
              //     self.jumper.rotation.z = Math.PI;
              //   }
              // }
    
            } else {
              self.jumper.position.z -= self.jumperStat.xSpeed
              // 在20倍以上的程度才有翻转效果
              // if(self.jumperStat.yTimes > 30){
              //   // 小人起跳翻转
              //   if(self.jumper.rotation.x < Math.PI*2){
              //     self.jumper.rotation.x -= Math.PI / jumperRotateBase;
              //   }
              //   // 到达最高点
              //   if(self.jumperStat.ySpeed == 0){
              //     self.jumper.rotation.x = -Math.PI;
              //   }
              // }
            }
    
            // jumper在垂直方向上运动
            self.jumper.position.y += self.jumperStat.ySpeed
            // 运动伴随着缩放
            if ( self.jumper.scale.y < 1 ) {
              self.jumper.scale.y += 0.01;
            }
            self.jumperStat.ySpeed -= 0.01
            self._render(self.scene, self.camera)
    
            frameHandler = requestAnimationFrame(act);
          }else{
            cancelAnimationFrame(frameHandler);
            landed();
          }
        }
    
        function landed() {
          self.jumperStat.ready = false
          self.jumperStat.xSpeed = 0
          self.jumperStat.ySpeed = 0
          self.jumper.position.y = .5
          self.jumper.rotation.z = 0
          self.jumper.rotation.x = 0
    
          self._checkInCube();
    
          if (self.falledStat.location === 1) {
            var ActMusic = new Audio('./audio/jump.mp3');
            ActMusic.volume = 0.75;
            ActMusic.loop = false;
            ActMusic.play();
    
            // 掉落成功，进入下一步
            self.score += Math.pow(2, self.combo); // 随着combo
            self._createCube()
            self._updateCamera()
    
            if (self.successCallback) {
              self.successCallback(self.score)
            }
          } else {
            self._falling();
          }
        }
    
        act();
      }
      /**
       *游戏失败执行的碰撞效果
       *@param {String} dir 传入一个参数用于控制倒下的方向：'rightTop','rightBottom','leftTop','leftBottom','none'
      **/
      _fallingRotate (dir) {
        var self = this
        var offset = self.falledStat.distance - CUBE_WIDTH / 2
        var rotateAxis = 'z' // 旋转轴
        var rotateAdd = self.jumper.rotation[rotateAxis] + 0.1 // 旋转速度
        var rotateTo = self.jumper.rotation[rotateAxis] < Math.PI/2 // 旋转结束的弧度
        var fallingTo = GROUND + JUMPER_WIDTH / 2 + offset
    
        if (dir === 'rightTop') {
          rotateAxis = 'x'
          rotateAdd = self.jumper.rotation[rotateAxis] - 0.1
          rotateTo = self.jumper.rotation[rotateAxis] > -Math.PI/2
          self.jumper.translate.z = offset
          // self.jumper.geometry.translate.z = offset
        } else if (dir === 'rightBottom') {
          rotateAxis = 'x'
          rotateAdd = self.jumper.rotation[rotateAxis] + 0.1
          rotateTo = self.jumper.rotation[rotateAxis] < Math.PI/2
          self.jumper.translate.z = -offset
          // self.jumper.geometry.translate.z = -offset
        } else if (dir === 'leftBottom') {
          rotateAxis = 'z'
          rotateAdd = self.jumper.rotation[rotateAxis] - 0.1
          rotateTo = self.jumper.rotation[rotateAxis] > -Math.PI/2
          self.jumper.translate.x = -offset
          // self.jumper.geometry.translate.x = -offset
        } else if (dir === 'leftTop') {
          rotateAxis = 'z'
          rotateAdd = self.jumper.rotation[rotateAxis] + 0.1
          rotateTo = self.jumper.rotation[rotateAxis] < Math.PI/2
          self.jumper.translate.x = offset
          // self.jumper.geometry.translate.x = offset
        } else if (dir === 'none') {
          rotateTo = false
          fallingTo = self.config.ground
        } else {
          throw Error('Arguments Error')
        }
        if (!self.fallingStat.end) {
          if (rotateTo) {
            self.jumper.rotation[rotateAxis] = rotateAdd
          } else if (self.jumper.position.y > fallingTo) {
            self.jumper.position.y -= FALLING_SPEED
          } else {
            self.fallingStat.end = true
          }
          self._render()
          requestAnimationFrame(function(){
            self._falling()
          })
        } else {
          if (self.failedCallback) {
            self.failedCallback()
          }
        }
      }
      /**
       *游戏失败进入掉落阶段
       *通过确定掉落的位置来确定掉落效果
      **/
      _falling () {
        var self = this
        if (self.falledStat.location == 0) {
          self._fallingRotate('none')
        } else if (self.falledStat.location === -10) {
          if (self.cubeStat.nextDir == 'left') {
            self._fallingRotate('leftTop')
          } else {
            self._fallingRotate('rightTop')
          }
        } else if (self.falledStat.location === 10) {
          if (self.cubeStat.nextDir == 'left') {
            if (self.jumper.position.x < self.cubes[self.cubes.length - 1].position.x) {
              self._fallingRotate('leftTop')
            } else {
              self._fallingRotate('leftBottom')
            }
          } else {
            if (self.jumper.position.z < self.cubes[self.cubes.length - 1].position.z) {
              self._fallingRotate('rightTop')
            } else {
              self._fallingRotate('rightBottom')
            }
          }
        }
      }
      /**
       *判断jumper的掉落位置
       *@return {Number} this.falledStat.location
       * -1 : 掉落在原来的方块，游戏继续
       * -10: 掉落在原来方块的边缘，游戏失败
       *  1 : 掉落在下一个方块，游戏成功，游戏继续
       *  10: 掉落在下一个方块的边缘，游戏失败
       *  0 : 掉落在空白区域，游戏失败
      **/
      _checkInCube () {
    
        if (this.cubes.length > 1) {
          var cubeScore = 0;
          // jumper 的位置
          var pointO = {
            x: this.jumper.position.x,
            z: this.jumper.position.z
          }
          // 当前方块的位置
          var pointA = {
            x: this.cubes[this.cubes.length - 1 - 1].position.x,
            z: this.cubes[this.cubes.length - 1 - 1].position.z
          }
          // 下一个方块的位置
          var pointB = {
            x: this.cubes[this.cubes.length - 1].position.x,
            z: this.cubes[this.cubes.length - 1].position.z
          }
          var distanceS, // jumper和当前方块的坐标轴距离
              distanceL;  // jumper和下一个方块的坐标轴距离
          // 判断下一个方块相对当前方块的方向来确定计算距离的坐标轴
    
          if (this.cubeStat.nextDir === 'left') {
            distanceS = Math.abs(pointO.x - pointA.x)
            distanceL = Math.abs(pointO.x - pointB.x)
          } else {
            distanceS = Math.abs(pointO.z - pointA.z)
            distanceL = Math.abs(pointO.z - pointB.z)
          }
          var should = CUBE_WIDTH / 2 + JUMPER_WIDTH /2
          var result = 0
          if (distanceS < should ) {
            // 落在当前方块，将距离储存起来，并继续判断是否可以站稳
            this.falledStat.distance = distanceS
            result = distanceS < CUBE_WIDTH / 2 ? -1 : -10
          } else if (distanceL < should) {
            this.falledStat.distance = distanceL
            // 落在下一个方块，将距离储存起来，并继续判断是否可以站稳
            result = distanceL < CUBE_WIDTH / 2 ? 1 : 10
    
            if(pointO.x == pointB.x && pointO.z == pointB.z){
              this.combo++;
            }else{
              this.combo = 0;
            }
    
          } else {
            result = 0
          }
          this.falledStat.location = result;
        }
      }
      // 每成功一步, 重新计算摄像机的位置，保证游戏始终在画布中间进行
      _updateCameraPos () {
        var lastIndex = this.cubes.length - 1
        var pointA = {
          x: this.cubes[lastIndex].position.x,
          z: this.cubes[lastIndex].position.z
        }
        var pointB = {
          x: this.cubes[lastIndex - 1].position.x,
          z: this.cubes[lastIndex - 1].position.z
        }
        var pointR = new THREE.Vector3()
        pointR.x = (pointA.x + pointB.x) / 2
        pointR.y = 0
        pointR.z = (pointA.z + pointB.z) / 2
        this.cameraPos.next = pointR
      }
      // 基于更新后的摄像机位置，重新设置摄像机坐标
      _updateCamera () {
          var self = this
          var c = {
            x: self.cameraPos.current.x,
            y: self.cameraPos.current.y,
            z: self.cameraPos.current.z
          }
          var n = {
            x: self.cameraPos.next.x,
            y: self.cameraPos.next.y,
            z: self.cameraPos.next.z
          }
          if (c.x > n.x  || c.z > n.z) {
            self.cameraPos.current.x -= 0.1
            self.cameraPos.current.z -= 0.1
            if (self.cameraPos.current.x - self.cameraPos.next.x < 0.05) {
              self.cameraPos.current.x = self.cameraPos.next.x
            }
            if (self.cameraPos.current.z - self.cameraPos.next.z < 0.05) {
              self.cameraPos.current.z = self.cameraPos.next.z
            }
            self.camera.lookAt(new THREE.Vector3(c.x, 0, c.z))
    
            // 更新光源
            self._render()
            requestAnimationFrame(function(){
              self._updateCamera()
            })
          }
      }
      // 初始化jumper：游戏主角
      async _createJumper () {
        var self = this
        let model = null
        let dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("./draco/gltf/");
        dracoLoader.setDecoderConfig({type: "js"});
        let loader = new  GLTFLoader();
        loader.setDRACOLoader(loader);
        console.log(1111)
        var objModel =  new Promise((resolve, reject) =>{
          loader.load(this.modelPath, (gltf) => {
            
              gltf.scene.traverse(c => {
                  c.castShadow = true;
              });
              gltf.scene.scale.set(2.2, 2.2, 2.2)
              gltf.scene.position.set(0, 0, 0)
              gltf.scene.rotation.y = Math.PI / -2
              const clip = gltf.animations[0]
              const mixer = new THREE.AnimationMixer(gltf.scene)
              mixer.timeScale=1/5;
              const action = mixer.clipAction(clip)
              action.play()
              // this.scene.add(gltf.scene)
              model = gltf.scene
              resolve(gltf.scene)
          })
        })
        
        this.model =  await objModel
        var mesh = new THREE.Group();
        mesh.add(this.model);
        mesh.position.y = 3;
        mesh.position.x = JUMPER_WIDTH / 2;
        mesh.position.z = JUMPER_WIDTH / 2;
        this.jumper = mesh
        this.scene.add(this.jumper);
    
        this.directionalLight.target = this.jumper; // 将平行光跟随jumper
        function jumperInitFall() {
          if (self.jumper.position.y > 1) {
            self.jumper.position.y -= 0.1
            self._render(self.scene, self.camera)
            requestAnimationFrame(function () {
              jumperInitFall();
            })
          }
        }
        jumperInitFall();
    
      }
      // 新增一个方块, 新的方块有2个随机方向
      _createCube () {
        var geometryObj = this._createGeometry(); // 生成一个集合体
        var materialObj = this._createMaterial()(); // 生成材质
    
        var mesh = new THREE.Mesh(geometryObj.geometry, materialObj.material)
        mesh.castShadow = true; // 产生阴影
        mesh.receiveShadow = true;    // 接收阴影
    
        if( this.cubes.length ) {
          this.cubeStat.nextDir =  Math.random() > 0.5 ? 'left' : 'right'
          mesh.position.x = this.cubes[this.cubes.length - 1].position.x
          mesh.position.y = this.cubes[this.cubes.length - 1].position.y
          mesh.position.z = this.cubes[this.cubes.length - 1].position.z
          if (this.cubeStat.nextDir === 'left') {
            mesh.position.x = this.cubes[this.cubes.length - 1].position.x-4*Math.random() - 6
            // this.jumper.rotation.y = Math.PI / 2
          } else {
            // console.log(this.jumper.rotation.y)
            mesh.position.z = this.cubes[this.cubes.length - 1].position.z-4*Math.random() - 6
          }
        }
    
        this.cubes.push(mesh)
        // 当方块数大于6时，删除前面的方块，因为不会出现在画布中
        if (this.cubes.length > 6) {
          this.scene.remove(this.cubes.shift())
        }
        this.scene.add(mesh)
        // 每新增一个方块，重新计算摄像机坐标
        if ( this.cubes.length > 1) {
          this._updateCameraPos();
        }
    
      }
      _render () {
        this.renderer.render(this.scene, this.camera)
        this.snow.snowing(.3, .03)
        // requestAnimationFrame(this._render)
        // console.log(1)
      }
      _setLight () {
        var light = new THREE.AmbientLight( 0xffffff, 0.3 )
        this.scene.add( light )
    
        this.directionalLight = new THREE.DirectionalLight( 0xffffff , 10);
        this.directionalLight.distance = 0;
        this.directionalLight.position.set( 60, 50, 40 )
        this.directionalLight.castShadow = true; // 产生阴影
        this.directionalLight.intensity = 0.5;
        this.scene.add(this.directionalLight)
      }
      _setCamera () {
        this.camera.position.set(100, 100, 100)
        this.camera.lookAt(this.cameraPos.current)
      }
      _setRenderer () {
        this.renderer.setSize(this.size.width, this.size.height)
        this.renderer.setClearColor(BACKGROUND)
        this.renderer.shadowMap.enabled = true; // 开启阴影
    
        document.body.appendChild(this.renderer.domElement)
      }
      _setSize () {
        this.size.width = window.innerWidth,
        this.size.height = window.innerHeight
      }
      _createMaterial(){ // 生成材质/贴图
        var config = this.config;
         // 所有的材质数组
        var materials = [
          // {
          //   material : new THREE.MeshLambertMaterial({color: CUBE_COLOR}),
          //   type: 'DefaultCubeColor'
          // },
          // RandomColor(),
          // clockMaterial(),
          // RadialGradient(),
          // RadialGradient2(),
          Chess(), 
          Chess(),
          Chess(),
          Snow(),
          Snow(),
          Snow(),
          // wireFrame(),
        ];
    
        return function (idx) {
          if(idx == undefined){
            idx = Math.floor(Math.random()*materials.length);
          }
          return materials[idx];
        }
    
        function clockMaterial() {
          // var texture;
          var matArray = []; // 多贴图数组
    
          // texture = new THREE.CanvasTexture(canvasTexture); // 此处的canvasTexture来自canvas.texture.js文件
          // texture.needsUpdate = true;
          const boxTextureLoader = new THREE.TextureLoader();
          const boxTexture = boxTextureLoader.load('./bg.jpg');
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshBasicMaterial({ map: boxTexture }));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
    
          return {
            material : matArray,
            type: 'Clock'
          }
        }
    
        function RadialGradient() {
          var texture;
          var matArray = []; // 多贴图数组
    
          var canvasTexture1 = document.createElement("canvas");
          canvasTexture1.width=16;
          canvasTexture1.height=16;
          var ctx= canvasTexture1.getContext("2d");
          // 创建渐变
          var grd=ctx.createRadialGradient(50,50,32,60,60,100);
          grd.addColorStop(0,"red");
          grd.addColorStop(1,"white");
          // 填充渐变
          ctx.fillStyle=grd;
          ctx.fillRect(10,10,150,80);
    
          texture = new THREE.CanvasTexture(canvasTexture1);
          texture.needsUpdate = true;
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // 指定重复方向为两个方向
          texture.repeat.set(5,5); // 设置重复次数都为4
    
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshBasicMaterial({ map: texture }));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
    
          return {
            material : matArray,
            type: 'RadialGradient'
          }
        }
    
        function RadialGradient2() {
    
          var canvas = document.createElement('canvas');
          canvas.width = 16;
          canvas.height = 16;
    
          var context = canvas.getContext('2d');
          var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
          gradient.addColorStop(0, 'rgba(255,255,255,1)');
          gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
          gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
          gradient.addColorStop(1, 'rgba(0,0,0,1)');
    
          context.fillStyle = gradient;
          context.fillRect(0, 0, canvas.width, canvas.height);
    
          var matArray = []; // 多贴图数组
          var texture = new THREE.Texture(canvas);
          texture.needsUpdate = true;
    
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshBasicMaterial({ map: texture }));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
          matArray.push(new THREE.MeshLambertMaterial({color: CUBE_COLOR}));
    
          return {
            material : matArray,
            type: 'RadialGradient2'
          }
        }
    
        function Chess() {
          var texture = new THREE.TextureLoader().load('./textures/ice.png');
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // 指定重复方向为两个方向
          texture.repeat.set(1, 1); // 设置重复次数
          return {
            material : new THREE.MeshBasicMaterial( { map: texture } ),
            type : 'Chess'
          }
        }
        function Snow() {
          var texture = new THREE.TextureLoader().load('./textures/box.jpg');
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // 指定重复方向为两个方向
          texture.repeat.set(1, 1); // 设置重复次数
          return {
            material : new THREE.MeshBasicMaterial( { map: texture } ),
            type : 'Chess'
          }
        }
    
        function RandomColor(){
          var color = '#'+Math.floor(Math.random()*16777215).toString(16);
          return {
            material : new THREE.MeshLambertMaterial({color: color}),
            type : 'RandomColor',
            color : color,
          }
        }
    
        function wireFrame(){
          return {
            material: new THREE.MeshLambertMaterial({color: CUBE_COLOR, wireframe: true}),
            type: 'wireFrame'
          }
        }
    
      }
      _createGeometry(){ // 生成几合体
        var obj = {};
        if(Math.random() > 0.5){  // 添加圆柱型方块
          obj.geometry = new THREE.CylinderGeometry(CUBE_WIDTH / 2, CUBE_WIDTH / 2, CUBE_HEIGHT, 40)
          obj.type = 'CylinderGeometry';
        }else{ // 方块
          obj.geometry = new THREE.CubeGeometry(CUBE_WIDTH, CUBE_HEIGHT, CUBE_DEEP)
          obj.type = 'CubeGeometry';
        }
        return obj;
      }

}

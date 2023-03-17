const VERSION = import.meta.env.VITE_VERSION  // 版本号
const IS_MOBILE = true 
const IS_HELPER = false // 是否开启辅助坐标坐标
const BACKGROUND = '0x282828' // 背景颜色
const GROUND = -1 // 地面y坐标
const FALLING_SPEED = 0.2 // 游戏失败掉落速度
const CUBE_COLOR = '0xbebebe'
const CUBE_WIDTH = 3 // 方块宽度
const CUBE_HEIGHT = 1 // 方块高度
const CUBE_DEEP = 3 // 方块深度
const JUMPER_WIDTH = 1   // jumper宽度

export  {
    VERSION,
    IS_MOBILE,
    IS_HELPER,
    BACKGROUND,
    GROUND,
    FALLING_SPEED,
    CUBE_COLOR,
    CUBE_WIDTH,
    CUBE_HEIGHT,
    CUBE_DEEP,
    JUMPER_WIDTH
}
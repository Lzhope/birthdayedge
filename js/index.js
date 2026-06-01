// 全局变量
const birthdayMap = {
    2024: "2024-05-31",
    2025: "2025-05-31",
    2026: "2026-05-31",
    2027: "2027-05-31",
    2028: "2028-05-31",
    2029: "2029-05-31",
    2030: "2030-05-31",
}
const $btn = $("#birth-start-btn")
const $main = $(".main")
const $countdownPage = $("#particle-countdown")
let countdownTimer = null
let balloonTimerId = null

// 登录验证（账号密码）
const loginAccount = "吴雅玲"
const loginPassword = "0531"

function handleLogin() {
    const account = $("#login-account").val().trim()
    const password = $("#login-password").val().trim()

    if (!account) {
        $("#login-error").text("请输入账号")
        return
    }
    if (!password) {
        $("#login-error").text("请输入密码")
        return
    }

    // 验证账号
    if (account !== loginAccount) {
        $("#login-error").text("账号不对哦，再想想～")
        return
    }

    // 验证密码
    if (password !== loginPassword) {
        $("#login-error").text("密码不对哦，再试试～")
        return
    }

    // 验证通过
    $("#login-error").text("")
    $("#login-overlay").fadeOut(800, function () {
        // 开始正常流程
        startPage()
    })
}

function startPage() {
    // 初始化粒子系统
    initParticles()

    // 隐藏主内容
    $main.fadeOut(1)

    // 开始倒计时
    countdownTimer = setInterval(birthdayCountdown, 1000)

    // 绑定按钮
    $btn.click(pageRender)
}

// 页面加载完成
$(document).ready(function () {
    // 绑定登录按钮
    $("#login-btn").click(handleLogin)
    // 回车键也可以登录
    $("#login-account, #login-password").keydown(function (e) {
        if (e.key === "Enter") {
            handleLogin()
        }
    })
})

/* ====== 粒子系统 ====== */

const canvas = document.createElement("canvas")
canvas.id = "particle-canvas-inner"
let ctx = null
let particles = []
let animId = null
let isBirthdayToday = false
let displayText = ""

// 粒子类
class Particle {
    constructor() {
        this.reset()
    }
    reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.8
        this.speedY = (Math.random() - 0.5) * 0.8
        this.opacity = Math.random() * 0.6 + 0.3
        this.hue = 35 + Math.random() * 15  // 金色系 35-50
        this.baseX = this.x
        this.baseY = this.y
        this.vx = 0
        this.vy = 0
    }
    update() {
        this.x += this.speedX
        this.y += this.speedY
        // 边界反弹
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`
        ctx.fill()
        // 发光效果
        ctx.shadowBlur = this.size * 6
        ctx.shadowColor = `hsla(${this.hue}, 80%, 60%, 0.3)`
        ctx.fill()
        ctx.shadowBlur = 0
    }
}

function initParticles() {
    const container = document.getElementById("particle-canvas")
    if (!container) return

    canvas.width = container.offsetWidth || window.innerWidth
    canvas.height = container.offsetHeight || window.innerHeight

    // 只添加一次 canvas
    if (!document.getElementById("particle-canvas-inner")) {
        canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;display:block;"
        container.appendChild(canvas)
    }

    ctx = canvas.getContext("2d")

    // 生成粒子
    particles = []
    const count = Math.floor((canvas.width * canvas.height) / 4000)
    for (let i = 0; i < Math.max(150, count); i++) {
        particles.push(new Particle())
    }

    // 开始动画
    if (animId) cancelAnimationFrame(animId)
    animateParticles()
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 画粒子连线
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 120) {
                ctx.beginPath()
                ctx.moveTo(particles[i].x, particles[i].y)
                ctx.lineTo(particles[j].x, particles[j].y)
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.12 * (1 - dist / 120)})`
                ctx.lineWidth = 0.6
                ctx.stroke()
            }
        }
    }

    // 更新和绘制粒子
    particles.forEach(function (p) {
        p.update()
        p.draw()
    })

    // 绘制中间文字
    drawCenterText()

    animId = requestAnimationFrame(animateParticles)
}

function drawCenterText() {
    const w = canvas.width
    const h = canvas.height
    const isMobile = w < 600

    if (isBirthdayToday) {
        // 🎉 生日快乐
        ctx.save()
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // 主标题发光
        ctx.shadowBlur = 40
        ctx.shadowColor = "rgba(255,215,0,0.6)"
        ctx.font = isMobile ? "42px 'Microsoft YaHei',sans-serif" : "64px 'Microsoft YaHei',sans-serif"
        ctx.fillStyle = "#FFD700"
        ctx.fillText("🎉 生日快乐", w / 2, h / 2 - 40)

        ctx.shadowBlur = 0
    }

    // 倒计时文字
    if (displayText && !isBirthdayToday) {
        ctx.save()
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        ctx.shadowBlur = 30
        ctx.shadowColor = "rgba(255,215,0,0.4)"

        const fontSize = isMobile ? 36 : 54
        ctx.font = `300 ${fontSize}px 'Microsoft YaHei',sans-serif`
        ctx.fillStyle = "rgba(255,255,255,0.85)"
        ctx.fillText(displayText, w / 2, h / 2)

        ctx.shadowBlur = 0
        ctx.restore()
    }
}

function birthdayCountdown() {
    // 不限制日期，始终显示生日模式
    clearInterval(countdownTimer)
    isBirthdayToday = true
    displayText = ""
    $btn.text("🎉 来吧，展示")
    $btn.prop("disabled", false)
    $countdownPage.addClass("birthday-mode")

    // 播放 BGM
    const bgm = document.getElementById("bgm-home")
    if (bgm) {
        bgm.currentTime = 0
        bgm.volume = 0.4
        bgm.play()
    }
}

function pageRender() {
    // 粒子页淡出
    $countdownPage.fadeOut(1500, function () {
        // 停止粒子动画
        if (animId) {
            cancelAnimationFrame(animId)
            animId = null
        }
    })

    // 淡入主内容、展示祝词
    $main.fadeIn("slow")
    new Typed("#typed", {
        stringsElement: "#greeting-word",
        typeSpeed: 50,
        backSpeed: 25,
        loop: true,
    })

    // 随机气球
    startBalloons()

    // 继续播放 BGM（已经在前一步开始了）
    // 显示"前往蛋糕许愿"按钮（延迟一下，等祝福语打出来）
    setTimeout(function () {
        $("#go-cake-btn").fadeIn(600)
    }, 2500)
}

// 点击按钮跳转蛋糕页
$(document).on("click", "#go-cake-btn", function () {
    $("#go-cake-btn").text("🎂 出发！").prop("disabled", true)
    // 加个过渡遮罩再跳转
    $('body').append('<div id="page-transition" class="page-transition"><div class="pt-content"><div class="pt-icon">🎂</div><div class="pt-text">蛋糕正在赶来...</div></div></div>')
    setTimeout(function () {
        window.location.href = "cake.html"
    }, 1800)
})

/* ===== 随机气球 ===== */

const balloonColors = ["#FF6B6B","#4ECDC4","#FFE66D","#A8E6CF","#FF8A5C","#6C5B7B","#F8B195","#95E1D3","#F38181","#AA96DA","#FCBAD3","#B5EAD7","#C7CEEA","#FF9A9E","#A18CD1","#FBC2EB"]

function createBalloon() {
    const size = 28 + Math.random() * 24
    const left = 5 + Math.random() * 85
    const duration = 6 + Math.random() * 8
    const color = balloonColors[Math.floor(Math.random() * balloonColors.length)]

    const $balloon = $('<div class="floating-balloon"></div>')
    const $body = $('<div class="balloon-body"></div>').css({
        width: size + "px",
        height: (size * 1.15) + "px",
        background: `radial-gradient(circle at 35% 35%, ${lightenColor(color)}, ${color})`
    })
    const $tail = $('<div class="balloon-tail"></div>')

    $balloon.append($body).append($tail)
    $balloon.css({ left: left + "%" })
    $balloon.css("animation-duration", duration + "s")

    $("#balloon-container").append($balloon)

    setTimeout(function () {
        $balloon.remove()
    }, duration * 1000)
}

function lightenColor(hex) {
    const r = parseInt(hex.slice(1,3), 16)
    const g = parseInt(hex.slice(3,5), 16)
    const b = parseInt(hex.slice(5,7), 16)
    const lr = Math.min(255, r + 80)
    const lg = Math.min(255, g + 80)
    const lb = Math.min(255, b + 80)
    return `rgb(${lr},${lg},${lb})`
}

function startBalloons() {
    $("#balloon-container").empty()
    balloonTimerId = setInterval(createBalloon, 500)
    for (let i = 0; i < 6; i++) {
        setTimeout(createBalloon, i * 200)
    }
}

function stopBalloons() {
    if (balloonTimerId) {
        clearInterval(balloonTimerId)
        balloonTimerId = null
    }
}

// 窗口大小变化时重建粒子
$(window).resize(function () {
    if (ctx && particles.length > 0) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
})

// 页面加载完成
$(document).ready(function () {
    // 自动播放蛋糕场景 BGM（生日快乐钢琴版 - 仅前奏循环）
    setTimeout(function () {
        playIntroLoop("bgm-cake", 18, 0.35)
    }, 500)

    // 许愿按钮点击
    $(".cake-wish-btn").click(function () {
        const $this = $(this)
        const $prompt = $(".cake-wish-prompt")

        // 许愿完成动画
        $prompt.addClass("wish-done")

        setTimeout(function () {
            $prompt.hide()
            // 显示吹蜡烛提示
            $(".cake-sub-hint").fadeIn()
        }, 700)
    })

    // 吹蜡烛
    $("#cake-flame").click(function () {
        const $flame = $(this)

        if ($flame.hasClass("blown-out")) return

        $flame.addClass("blown-out")
        $(".cake-sub-hint").fadeOut()

        // 火焰熄灭后：蛋糕淡出 → 烟花绽放 → 信件出现
        setTimeout(function () {
            $("#cake-scene").fadeOut(800, function () {
                // 烟花绽放
                startFireworks(function () {
                    // 过渡提示 → 显示信件
                    showTransition("💌", "有几封信正在路上...", function () {
                        showLetter()
                    })
                })
            })
        }, 1200)
    })
})

/* ===== 4 封信随机散落 ===== */

let lettersRead = 0

function showLetter() {
    lettersRead = 0
    $(".letter-paper-wrapper").hide()
    $(".envelope-scatter").show().removeClass("opened read")
    $(".envelope-scatter .envelope").removeClass("opened")
    $(".envelope-scatter .envelope-flap").show()
    $(".envelope-scatter .envelope-heart").each(function (idx) {
        const hearts = ["💌", "💕", "💪", "🤗"]
        $(this).text(hearts[idx])
    })
    $(".letter-hint").hide()
    $("#letter-read-count").text("0")
    $(".letter-read-progress").show()
    $(".letter-arrive-title").text("💌 有几封来自朋友们的信")

    // 4 个信封由 flex 自动居中排列，只需加一点旋转装饰
    $(".envelope-scatter").each(function () {
        $(this).css({
            transform: "rotate(" + (Math.random() * 4 - 2) + "deg)"
        })
    })

    // 停止蛋糕 BGM，切换到信件 BGM（童话 - 完整循环）
    const bgmCake = document.getElementById("bgm-cake")
    if (bgmCake) {
        bgmCake.pause()
        bgmCake.currentTime = 0
    }
    const audio = document.getElementById("bgm-letter")
    if (audio) {
        audio.volume = 0.35
        audio.currentTime = 0
        audio.loop = true
        audio.play()
    }

    $("#letter-container").fadeIn(800)
}

// 点击信封翻开（点信封本身或其封口都可以）
$(document).on("click", ".envelope-scatter", function () {
    const $scatter = $(this)
    if ($scatter.hasClass("opened") || $scatter.hasClass("read")) return

    const idx = parseInt($scatter.data("letter"))
    const $flap = $scatter.find(".envelope-flap")

    // 翻开封口
    $scatter.find(".envelope").addClass("opened")
    $flap.hide()

    // 封口翻开后，弹出对应的信纸
    setTimeout(function () {
        $(".letter-paper-wrapper[data-letter='" + idx + "']").fadeIn(600)
    }, 500)
})

// 点击信纸上的关闭按钮
$(document).on("click", ".close-letter", function () {
    const $btn = $(this)
    const $paper = $btn.closest(".letter-paper-wrapper")
    const idx = parseInt($paper.data("letter"))

    $paper.fadeOut(300, function () {
        // 标记这封信已读
        const $scatter = $(".envelope-scatter[data-letter='" + idx + "']")
        $scatter.addClass("read")
        $scatter.find(".envelope-flap").hide()
        $scatter.find(".envelope-heart").text("💝")

        lettersRead++
        $("#letter-read-count").text(lettersRead)

        if (lettersRead >= 4) {
            // 4 封都读完了 → 短暂停留后显示礼物盒
            setTimeout(function () {
                $("#letter-container").fadeOut(600, function () {
                    showTransition("🎁", "还有一个惊喜等着你...", function () {
                        showGiftBox()
                    })
                })
            }, 1200)
        }
    })
})

/* ===== 多礼物选择 ===== */

let giftsOpened = 0
const giftVideoPaths = [
    "",
    "微信视频2026-05-30_154756_796.mp4",
    "微信视频2026-05-30_154814_154.mp4"
]

function showGiftBox() {
    giftsOpened = 0
    $(".gift-item").removeClass("opened")
    $(".gift-item .gift-box").removeClass("opened")
    $(".gift-hint").show()
    $("#gift-open-count").text("0")
    $(".gift-read-progress").show()
    $(".gift-arrive-title").text("🎁 有 3 份礼物在等着你")
    $("#gift-container").fadeIn(800)
}

// 点击任意礼物盒
$(document).on("click", ".gift-item .gift-box", function () {
    const $box = $(this)
    const $item = $box.closest(".gift-item")
    if ($item.hasClass("opened")) return

    $item.addClass("opened")
    $box.addClass("opened")
    giftsOpened++
    $("#gift-open-count").text(giftsOpened)

    const giftIdx = parseInt($item.data("gift"))

    // 等盖子打开动画播完后展示内容
    setTimeout(function () {
        if (giftIdx === 0) {
            // 第一个礼物 → 祝福弹窗
            spawnBlessingPopups()
        } else {
            // 视频礼物 → 播放视频
            const videoIdx = parseInt($item.data("video"))
            const $video = $("#gift-video")
            const $source = $("#gift-video-source")
            $source.attr("src", giftVideoPaths[videoIdx])
            $video[0].load()
            $("#video-player-overlay").fadeIn(400)
            $video[0].play()
        }
    }, 600)
})

// 关闭视频播放器
$(document).on("click", ".video-close-btn", function () {
    const $video = $("#gift-video")
    $video[0].pause()
    $video[0].currentTime = 0
    $("#video-player-overlay").fadeOut(300)
})

// 点击背景也可关闭
$(document).on("click", "#video-player-overlay", function (e) {
    if ($(e.target).is("#video-player-overlay") || $(e.target).is(".video-player-bg")) {
        const $video = $("#gift-video")
        $video[0].pause()
        $video[0].currentTime = 0
        $("#video-player-overlay").fadeOut(300)
    }
})

// ===== 祝福弹窗（还原桌面 exe 程序效果） =====

const blessingTips = [
    "保持微笑呀", "今天过得开心嘛", "期待下一次见面", "顺顺利利", "早点休息",
    "保持好心情", "每天都要元气满满", "梦想成真", "好好爱自己", "多喝水利~",
    "天冷了，多穿衣服", "我想你了", "别熬夜", "所有烦恼都消失", "记得吃水果",
    "前程似锦", "天天开心", "快乐常伴", "好好爱自己", "加油呀",
    "你是最棒的", "未来可期", "万事胜意", "岁岁平安", "百事可乐"
]

const popupColors = [
    "#ff9999", "#66b3ff", "#99ff99", "#ffcc99", "#c2c2f0",
    "#ffb3e6", "#ffdfba", "#b3b3b3", "#ff7f50", "#87ceeb",
    "#90ee90", "#dda0dd", "#f0e68c", "#ff69b4", "#4682b4",
    "#ff6b6b", "#48d1cc", "#ffa07a", "#98fb98", "#daa520"
]

function spawnBlessingPopups() {
    const $container = $("#popup-container")
    $container.empty()

    const popups = []
    const total = 200

    for (let i = 0; i < total; i++) {
        (function (idx) {
            setTimeout(function () {
                const tip = blessingTips[Math.floor(Math.random() * blessingTips.length)]
                const color = popupColors[Math.floor(Math.random() * popupColors.length)]
                const w = 150 + Math.random() * 150
                const h = 80 + Math.random() * 40
                const x = Math.random() * (window.innerWidth - w)
                const y = Math.random() * (window.innerHeight - h)

                const $popup = $('<div class="blessing-popup"><span class="popup-text">' + tip + '</span></div>')
                $popup.css({
                    width: w + "px",
                    height: h + "px",
                    left: x + "px",
                    top: y + "px",
                    background: color
                })
                $container.append($popup)
                popups.push($popup)
            }, idx * 80)
        })(i)
    }

    // 所有弹窗出现后停留 6 秒，然后逐个消失
    const totalTime = total * 80 + 6000
    setTimeout(function () {
        closePopupsOneByOne(popups)
    }, totalTime)
}

function closePopupsOneByOne(popups) {
    if (popups.length === 0) {
        // 全部关闭后过渡提示 → 显示"写给未来自己的一封信"
        showTransition("✍️", "最后还有一件事...", function () {
            showFutureLetter()
        })
        return
    }

    const $popup = popups.shift()
    $popup.addClass("fly-out")
    setTimeout(function () {
        $popup.remove()
        setTimeout(function () {
            closePopupsOneByOne(popups)
        }, 30)
    }, 400)
}

/* ===== 写给未来自己的一封信 ===== */

function showFutureLetter() {
    $("#gift-container").fadeOut(500, function () {
        $("#future-letter").fadeIn(800)
    })
}

// 写信完成，直接进入总结祝福
$(document).on("click", "#future-send-btn", function () {
    const $btn = $(this)
    const $status = $("#future-status")
    const message = $("#future-message").val().trim()

    if (!message) {
        $status.text("💬 写点什么吧~").css("color", "#C4515C")
        return
    }

    $btn.prop("disabled", true).text("💌 ...")
    $status.text("💌 未来的自己一定会收到这封信的~").css("color", "#2E7D32")
    setTimeout(function () {
        showFinalBlessing()
    }, 2000)
})


/* ===== 通用过渡遮罩 ===== */

function showTransition(icon, text, callback) {
    const $overlay = $("#transition-overlay")
    $overlay.find(".transition-icon").text(icon)
    $overlay.find(".transition-text").text(text)
    $overlay.fadeIn(500, function () {
        setTimeout(function () {
            $overlay.fadeOut(500, function () {
                if (callback) callback()
            })
        }, 1800)
    })
}

/* ===== 总结祝福语 ===== */

function showFinalBlessing() {
    $("#future-letter").fadeOut(600, function () {
        $("#final-blessing").fadeIn(800)
    })
}

/* ===== 前奏循环播放函数 ===== */

function playIntroLoop(audioId, introSeconds, vol) {
    try {
        const audio = document.getElementById(audioId)
        if (!audio) return

        audio.volume = vol || 0.35
        audio.currentTime = 0
        audio.loop = false

        // 清除之前的 timeupdate 回调
        audio.ontimeupdate = null

        audio.play()

        // 播放到 introSeconds 秒时跳回开头 → 实现前奏无限循环
        audio.ontimeupdate = function () {
            if (audio.currentTime >= introSeconds) {
                audio.currentTime = 0
            }
        }
    } catch (e) {
        console.log("BGM play error")
    }
}

/* ===== 烟花效果 ===== */

function startFireworks(callback) {
    // 创建烟花容器
    const $container = $('<div id="firework-container"><canvas id="firework-canvas"></canvas></div>')
    $("body").append($container)

    const canvas = document.getElementById("firework-canvas")
    const ctx = canvas.getContext("2d")

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const colors = ["#FF6B6B","#FFD700","#FF69B4","#48D1CC","#FFA07A","#DDA0DD","#98FB98","#87CEEB"]

    function createBurst(cx, cy) {
        const count = 60 + Math.floor(Math.random() * 40)
        const color = colors[Math.floor(Math.random() * colors.length)]
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i
            const speed = 2 + Math.random() * 4
            particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 2 + Math.random() * 3,
                life: 1,
                decay: 0.008 + Math.random() * 0.012
            })
        }
    }

    // 多轮烟花
    const burstCount = 6
    const burstInterval = 500

    for (let i = 0; i < burstCount; i++) {
        setTimeout(function () {
            const cx = 100 + Math.random() * (canvas.width - 200)
            const cy = 80 + Math.random() * (canvas.height * 0.5)
            createBurst(cx, cy)
        }, i * burstInterval)
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        let alive = false
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i]
            p.x += p.vx
            p.y += p.vy
            p.vy += 0.04
            p.life -= p.decay

            if (p.life <= 0) {
                particles.splice(i, 1)
                continue
            }

            alive = true
            ctx.globalAlpha = p.life
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
            ctx.fill()
        }

        ctx.globalAlpha = 1

        if (alive || particles.length > 0) {
            requestAnimationFrame(animate)
        } else {
            // 所有烟花粒子消失后，等待 0.5 秒淡出容器
            setTimeout(function () {
                $container.fadeOut(600, function () {
                    $container.remove()
                    if (callback) callback()
                })
            }, 500)
        }
    }

    animate()
}



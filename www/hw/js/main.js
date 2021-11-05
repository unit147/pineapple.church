/*
##     ##  #######  ##       ##    ##    ##     ##    ###    ########   ######  
##     ## ##     ## ##        ##  ##     ##     ##   ## ##   ##     ## ##    ## 
##     ## ##     ## ##         ####      ##     ##  ##   ##  ##     ## ##       
######### ##     ## ##          ##       ##     ## ##     ## ########   ######  
##     ## ##     ## ##          ##        ##   ##  ######### ##   ##         ## 
##     ## ##     ## ##          ##         ## ##   ##     ## ##    ##  ##    ## 
##     ##  #######  ########    ##          ###    ##     ## ##     ##  ######  
*/
var imCanvas = $(".canvas"),
  imScene = $(".page-scene"),
  title = $(".title"),
  titleWrap = $(".titlewrap"),
  vol = 20,
  score = 0,
  ammo = $(".bullet").length,
  hpbar = $(".current-hp"),
  hpText = $(".hitpoints span"),
  username,
  hp = 100,
  paused = false,
  muted = false,
  soundsToLoad = 9,
  loadedSounds = 0,
  mfckScore = 0,
  enemiesArr = [],
  excellentScore = 0,
  shotsMade = 0,
  targetsHits = 0,
  targetsMissed = 0,
  bossReached = false,
  iconsArr,
  gameLost = false,
  crackedWindow = $(".cracked-window"),
  explosionImg = "img/game/expl.png",
  shieldAbsorbtionImg = "img/game/hit-absorbtion.png",
  boss = "",
  bossHP = 10000,
  bossSP = 10000,
  bossDisplay = "",
  bossHitbox = "",
  bossBounds = [],
  bossHitboxW = 0,
  bossHitboxH = 0,
  bossShieldActive = false,
  bossIsStunImmune = false,
  bossIsStunned = false,
  playerBounds = [],
  playerHitboxW = 0,
  playerHitboxH = 0,
  laserSword = "",
  laserSwordLoaded = false,
	scoreLimit = 20000,
  dev = false;
$("#scene").parallax("enable");

/* sounds */
soundManager.defaultOptions = {
  autoLoad: true,
  multiShot: true,
  volume: vol,
  onload: function () {
    if (loadedSounds != soundsToLoad) {
      loadedSounds++;
    }
    if (loadedSounds == soundsToLoad) {
      TweenMax.to($(".game-preloader"), 1, {
        alpha: 0,
        onComplete: function () {
          $(".game-preloader").remove();
          mainMenu(); //init
        },
      });
    }
  },
};
var shotSound,
  noammoSound,
  reloadSound,
  explosionSound,
  ie7Sound,
  ieSound,
  introSound,
  gameSound,
  surpriseSound,
  excellentSound,
  enemyBlasterSound,
  playerKilledSound;

soundManager.setup({
  url: "js/",
  preferFlash: false,
  debugMode: false,
  html5PollingInterval: 50,
  onready: function () {
    shotSound = soundManager.createSound({ url: "sound/shot.mp3" });
    noammoSound = soundManager.createSound({ url: "sound/noammo.mp3" });
    jabbaLaugh = soundManager.createSound({ url: "sound/jabba.mp3" });
    reloadSound = soundManager.createSound({ url: "sound/reload.mp3" });
    explosionSound = soundManager.createSound({ url: "sound/explosion.mp3" });
    ie7Sound = soundManager.createSound({ url: "sound/oorah.mp3" });
    ieSound = soundManager.createSound({ url: "sound/toasty.mp3" });
		useTheForceSound = 	soundManager.createSound({url: 'sound/usetheforce.mp3'});
    bossSound = soundManager.createSound({
      url: "sound/boss.mp3",
      volume: 10,
      stream: false,
      loops: 999,
    });
    absorbSound = soundManager.createSound({ url: "sound/absorb.mp3" });
    mkLaugh = soundManager.createSound({ url: "sound/mk-laugh.mp3" });
    surpriseSound = soundManager.createSound({
      url: "sound/rand/surprise.mp3",
    });
    excellentSound = soundManager.createSound({
      url: "sound/rand/excellent.mp3",
    });
    enemyBlasterSound = soundManager.createSound({
      url: "sound/enemyblaster.mp3",
    });
    playerKilledSound = soundManager.createSound({
      url: "sound/playerkilled.mp3",
    });
    winXPSound = soundManager.createSound({ url: "sound/wxp.mp3" });
    introSound = soundManager.createSound({
      url: "sound/swtheme.mp3",
      stream: false,
    });
    gameSound = soundManager.createSound({
      url: "sound/dvtheme.mp3",
      stream: false,
      loops: 999,
    });

    iconsArr = [
      [100, , "ff"],
      [200, , "op"],
      [200, , "sf"],
      [100, , "ns"],
      [150, , "mx"],
      [50, , "wtf"],
      [50, , "wtf2"],
      [500, ieSound, "ie"],
      [1000, ie7Sound, "ie7"],
    ];
  },
  ontimeout: function () {
    console.log("### SOUND ERROR ###");
  },
});

/*

######## ##     ## ##    ##  ######  ######## ####  #######  ##    ##  ######  
##       ##     ## ###   ## ##    ##    ##     ##  ##     ## ###   ## ##    ## 
##       ##     ## ####  ## ##          ##     ##  ##     ## ####  ## ##       
######   ##     ## ## ## ## ##          ##     ##  ##     ## ## ## ##  ######  
##       ##     ## ##  #### ##          ##     ##  ##     ## ##  ####       ## 
##       ##     ## ##   ### ##    ##    ##     ##  ##     ## ##   ### ##    ## 
##        #######  ##    ##  ######     ##    ####  #######  ##    ##  ######  

*/
function pauseToggle() {
  if (!paused) {
    paused = true;
    TweenMax.pauseAll();
    $(".pause-control").addClass("pc-paused");
  } else {
    paused = false;
    TweenMax.resumeAll();
    $(".pause-control").removeClass("pc-paused");
  }
}

function muteToggle(link) {
  if (muted == true) {
    muted = false;
    soundManager.unmute();
    $(".sound-control").removeClass("sc-muted");
  } else {
    muted = true;
    soundManager.mute();
    $(".sound-control").addClass("sc-muted");
  }
  if (link == true) {
    muted = true;
    soundManager.mute();
    $(".sound-control").addClass("sc-muted");
  }
}

function gameOver() {
  gameLost = true;
  playerKilledSound.play();

  var obj = document.createElement("div");
  obj.className = "game-tint";
  $(imCanvas).append(obj);
  TweenMax.fromTo(
    $(obj),
    2.8,
    { opacity: 0 },
    {
      opacity: 1,
      onComplete: function () {
        TweenMax.to($(obj), 5, { opacity: 0 });
        shakeScreen(35);
        addCenterMessage("GAME OVER", false);
        // postScore();
        $(".game-reload").fadeIn();
      },
    }
  );
  // $(imScene).addClass('desaturate');
}

function createDisplayObject(t, c) {
  var obj = document.createElement(t);
  obj.className = c;
  return obj;
}

function createEnemies() {
  for (var i = 0; i < 5; i++) {
    createEnemy();
  }
}

function createEnemy() {
  var obj = document.createElement("img");
  obj.className = "circle";
  $(imCanvas).append(obj);
  $(obj).on("dragstart", function (e) {
    e.preventDefault();
  });
  var randSize = Math.round(
      Math.random() * $(obj).width() + $(obj).width() / 3
    ),
    xPos = Math.round(Math.random() * $(imCanvas).width() - $(obj).width()),
    yPos = $(imCanvas).height(),
    randIcon = Math.round(Math.random() * (iconsArr.length - 1));
  if (xPos < 0) xPos = 0;
  obj.score = iconsArr[randIcon][0];
  obj.deathSound = iconsArr[randIcon][1];
  obj.hostile = Math.random() < 0.5 ? true : false;
  obj.dead = 0;
  obj.src = "img/game/icons/" + randIcon + ".png";
  $(obj).css({
    top: yPos,
    left: xPos,
    width: randSize,
    height: randSize,
  });

  var randTime = Math.round(Math.random() * 6) + 2,
    endPoint = -$(imCanvas).height() - $(obj).height();

  obj.tween = TweenMax.to($(obj), randTime, {
    top: endPoint,
    ease: Linear.easeNone,
    onComplete: function () {
      obj.tween.kill();
      $(obj).remove();
      if (obj.dead === 0) targetsMissed += 1;
      if (!bossReached) {
        createEnemy();
      }
    },
  });

  if (obj.hostile && gameLost !== true) {
    setTimeout(function () {
      if (obj.dead === 0 && paused === false && gameLost !== true) {
        obj.tween.pause();
        shootAtPlayer(obj);
      }
    }, Math.round((randTime / 3) * 1000));
  }
  enemiesArr.push(obj);
}

function shootAtPlayer(enemy) {
  var obj = document.createElement("img");
  obj.className = "enemy-shot";
  obj.src = "img/game/enemy-shot.png";
  $(imCanvas).append(obj);
  var posX = $(enemy).position().left + $(enemy).width() / 2;
  var posY = $(enemy).position().top + $(enemy).height() / 2;
  $(obj).css({ top: posY, left: posX });
  TweenMax.to($(obj), 0.2, {
    scaleX: 1.5,
    scaleY: 1.5,
    left: $(imCanvas).width() / 2,
    top: $(imCanvas).height() / 2,
    onComplete: function () {
      $(obj).remove();
    },
  });

  enemyBlasterSound.play();
  takeDamage();
  shakeScreen(5);
  setTimeout(function () {
    enemy.tween.play();
  }, 300);
}

function killAllEnemies() {
  $.each(enemiesArr, function (i) {
    this.dead = 1;
    this.hostile = 0;
    TweenMax.killTweensOf(this);
    $(this).remove();
  });
  enemiesArr = [];
}

function shoot(e) {
  if (gameLost === true) {
    return false;
  }
  if (ammo != 0 && !paused) {
    if (e.target.className === "circle") {
      addExplosion(e);
      hit(e);
    } else {
      miss(e);
    }
    useAmmo();
  } else if (paused) {
    pauseToggle();
  } else if (ammo === 0) {
    noammoSound.play();
    TweenMax.to($(".reload"), 0.2, {
      alpha: 0,
      onComplete: function () {
        TweenMax.to($(".reload"), 0.2, { alpha: 1 });
      },
    });
  }
}

function hit(e) {
  updateScore(e.target.score);
  animateScore(e.target);
  explosionSound.play();
  e.target.dead = 1;
  targetsHits++;
  if (e.target.deathSound !== undefined && !bossReached) {
    e.target.deathSound.play();
  }
  if (e.target.deathSound === ieSound && !bossReached) {
    addDroid();
  }
  $(e.target).remove();
  e.target.tween.play();
}

function miss(e) {
  addMiss(e);
  shotSound.play();
}

function addExplosion(e) {
  var obj = document.createElement("img");
  obj.className = "shot";
  obj.src = "img/game/expl.png";
  $(imCanvas).prepend(obj);
  var posX = $(e.target).position().left;
  var posY = $(e.target).position().top;
  $(obj).css({ top: posY, left: posX });
  TweenMax.to($(obj), 0.15, {
    rotation: 360,
    scaleX: 2,
    scaleY: 2,
    alpha: 0,
    ease: Linear.easeNone,
    onComplete: function () {
      $(obj).remove();
    },
  });
}
function addMiss(e) {
  var obj = document.createElement("img");
  obj.className = "miss";
  obj.src = "img/game/miss.png";
  $(imCanvas).prepend(obj);
  var posX = e.pageX - $(imCanvas).offset().left - 25;
  var posY = e.pageY - $(imCanvas).offset().top - 25;
  $(obj).css({ top: posY, left: posX });
  TweenMax.to($(obj), 1, {
    scaleX: 0.2,
    scaleY: 0.2,
    alpha: 0,
    onComplete: function () {
      $(obj).remove();
    },
  });
}

function updateScore(n) {
  score += n;
  mfckScore += n;
  excellentScore += n;
  $(".score>span").text(score);
  if (mfckScore >= 10000) {
    mfckScore = 0;
    excellentScore = 0;
    animateTotalScore();
  } else if (excellentScore >= 5000) {
    excellentScore = 0;
    excellentSound.play();
    animateTotalScore();
  }
  if (score >= scoreLimit) {
    onBossReached();
  }
}

function reloadAmmo() {
  ammo = $(".bullet").length;
  $(".bullet").removeClass("bullet-used");
  reloadSound.play();
  $(".reload").css({ display: "none" });
}

function useAmmo() {
  ammo -= 1;
  $(".bullet:nth-child(" + (ammo + 2) + ")").addClass("bullet-used");
  if (ammo === 0) $(".reload").css({ display: "inline-block" });
  shotsMade++;
}

function animateScore(t) {
  var pos = $(t).position(),
    obj = document.createElement("div");
  obj.className = "score-animation";
  $(obj).text("+" + t.score);
  $(imCanvas).prepend(obj);
  $(obj).css({ top: pos.top, left: pos.left });
  TweenMax.to($(obj), 1, {
    scaleX: 2,
    scaleY: 2,
    alpha: 0,
    ease: Linear.easeNone,
    onComplete: function () {
      $(obj).remove();
    },
  });
}

function addDroid() {
  var obj = document.createElement("img");
  obj.className = "droid";
  obj.src = "img/game/droid.png";
  $(imCanvas).prepend(obj);
  $(obj).css({ bottom: -50, left: -80 });
  setTimeout(function () {
    $(obj).remove();
  }, 700);
}

function animateTotalScore() {
  var obj = $(".score").clone().prependTo($(imCanvas));
  TweenMax.to($(obj), 1, {
    scaleX: 10,
    scaleY: 10,
    alpha: 0,
    ease: Linear.easeNone,
    onComplete: function () {
      $(obj).remove();
    },
  });
}

function addCenterMessage(t, tween) {
  var obj = createDisplayObject("div", "game-preloader");
  $(imCanvas).prepend(obj);
  $(imCanvas).css("font-size", "18px");
  $(obj).html(t);
  if (tween == undefined) {
    TweenMax.to($(obj), 0.5, {
      delay: 1,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      ease: Linear.easeNone,
      onComplete: function () {
        $(obj).remove();
      },
    });
  }
}
/*
########  #### ##    ## ########  #### ##    ##  ######    ######  
##     ##  ##  ###   ## ##     ##  ##  ###   ## ##    ##  ##    ## 
##     ##  ##  ####  ## ##     ##  ##  ####  ## ##        ##       
########   ##  ## ## ## ##     ##  ##  ## ## ## ##   ####  ######  
##     ##  ##  ##  #### ##     ##  ##  ##  #### ##    ##        ## 
##     ##  ##  ##   ### ##     ##  ##  ##   ### ##    ##  ##    ## 
########  #### ##    ## ########  #### ##    ##  ######    ######  
*/
function bindShoot() {
  $(imCanvas).on("mousedown", function (e) {
    if (e.which === 1) {
      shoot(e);
    }
  });
}
function unBindShoot() {
  $(imCanvas).off("mousedown");
}
function bindReload() {
  $(imCanvas).on("contextmenu", function (e) {
    e.preventDefault();
    reloadAmmo();
    return false;
  });
  $(".reload").on("click", function () {
    reloadAmmo();
  });
}
function unBindReload() {
  $(imCanvas).off("contextmenu");
  $(".reload").off("click");
}
function bindPlayerMovement() {
  $(window).on("mousemove", function (e) {
    if (paused || gameLost) return;
		// console.log(e.pageX, $(imCanvas).offset().left)
    TweenLite.to($(player), 0.3, {
      left: e.pageX  - $(imCanvas).offset().left - ($(player).width() / 2) ,
			//  - $(player).width() / 2) 
			// - ($(imCanvas).position().left * 2),
      onUpdate: updatePlayerBounds,
    });
  });
}
function unBindPlayerMovement() {
  $(window).off("mousemove");
}
function bindPlayerShooting() {
  $(window).on("contextmenu", function (e) {
    e.preventDefault();
  });
  $(window).on("mousedown", function (e) {
    if (paused || gameLost) return;
    playerShoot();
  });
}
function unBindPlayerShooting() {
  $(window).off("mousemove");
}
function bindSwordPickup() {
  $("body").on("mousemove", function (e) {
    if (paused || gameLost) return;
    pickupSword();
  });
}
function unBindSwordPickup() {
  $("body").off("mousemove");
}

/*
 ######  ########    ###    ########  ######## 
##    ##    ##      ## ##   ##     ##    ##    
##          ##     ##   ##  ##     ##    ##    
 ######     ##    ##     ## ########     ##    
      ##    ##    ######### ##   ##      ##    
##    ##    ##    ##     ## ##    ##     ##    
 ######     ##    ##     ## ##     ##    ##    
*/
$(".subm").on("click", function () {
  if ($(".spaceship input").val() !== "") {
    username = $(".spaceship input").val();
    $(".spaceship form").css("display", "none");
  }
});

function startGame(gamerestart) {
  if (gamerestart !== true) {
    $(".ammo, .score").fadeIn();
    $(".holywars").fadeOut();
    createEnemies();
    /* EVENTS */
    bindShoot();
    bindReload();

    $(".pause-control").fadeIn();
    $(".pause-control").on("click", function () {
      pauseToggle();
    });
    $(".hitpoints").fadeIn();

    $(".game-reload").on("click", function () {
      restartGame();
      $(".game-reload").css("display", "none");
    });
  }
}

function restartGame() {
  reloadAmmo();
  score = 0;
  mfckScore = 0;
  excellentScore = 0;
  updateScore(0);
  resetHP();
  if (paused === true) pauseToggle();
  shotsMade = 0;
  targetsHits = 0;
  targetsMissed = 0;
  gameLost = false;
  $(".game-preloader").remove();
  $(".cracked-window").remove();
	if (bossReached) {
		bossHP = 10000;
  	bossSP = 10000;
		TweenMax.to($(boss).find(".boss-hp"), 0.3, { width: bossHP / 50 });
		TweenMax.to($(boss).find(".boss-sp"), 0.3, { width: bossSP / 50 });
	}
}

function mainMenu() {
  if (dev === true) {
    devStart();
    return false;
  }
  $(imScene).prepend(title);
  $(".holywars").css({ display: "block" });
  $(".sound-control").fadeIn();
  $(".sound-control").on("click", function () {
    muteToggle();
  });

  var tl = new TimelineMax();
  TweenMax.set($(title), { transformPerspective: 300, rotationX: 25, y: 500 });
  TweenMax.set($(titleWrap), { y: 70 });
  tl.add(
    TweenMax.from($(".holywars"), 1, {
      scaleY: 0.1,
      scaleX: 0.1,
      top: 200,
      onComplete: function () {
        $(".holywars").addClass("show-button");
        tl.pause();
        $(".holywars").on("click", function () {
          introSound.play();
          tl.play();
          $(".holywars").removeClass("show-button");
        });
      },
    })
  );
  tl.add(
    TweenMax.to($(".holywars"), 1, {
      delay: 1,
      top: 0,
      scaleY: 0.5,
      scaleX: 0.5,
    })
  );

  tl.add(
    TweenMax.to($(titleWrap), 3, {
      y: -670,
      ease: Linear.easeNone,
      onComplete: function () {
        $(".spaceship").css({ display: "block" });
        TweenMax.fromTo(
          $(".spaceship"),
          1,
          { top: 0, left: 0, scaleY: 0.1, scaleX: 0.1 },
          {
            top: 430,
            left: $(imCanvas).width() / 2 - $(".spaceship").width() / 2,
            scaleY: 1,
            scaleX: 1,
            onComplete: function () {
              $(".spaceship form").css("display", "block");
            },
          }
        );
      },
    })
  );
  var clicked = 0;
  $(".spaceship").on("click", function () {
    // if(username===undefined)return false;
    if (clicked === 0) {
      clicked = 1;
      $(".chromeplanet").css({ display: "block", opacity: 0 });
      TweenMax.to($(".chromeplanet"), 2, { right: 30, alpha: 1 });
      $(title).fadeOut();
      TweenMax.to($(".spaceship"), 3, {
        top: 10,
        left: $(imCanvas).width(),
        rotation: -30,
        scaleY: 0.1,
        scaleX: 0.1,
        alpha: 0.2,
        onComplete: function () {
          $(".spaceship").remove();
          addCenterMessage("GET READY...");
          setTimeout(function () {
            addCenterMessage("SHOOT!");
          }, 1500);
          setTimeout(function () {
            introSound.stop();
            gameSound.play();
            startGame();
          }, 3000);
        },
      });
    }
  });
}

function devStart() {
  startGame();
  $(".chromeplanet").css({ display: "block", opacity: 0 });
  TweenMax.to($(".chromeplanet"), 2, { right: 30, alpha: 1 });
  $(".sound-control").fadeIn();
  // gameOver();
}

/*
########  ##          ###    ##    ## ######## ########  
##     ## ##         ## ##    ##  ##  ##       ##     ## 
##     ## ##        ##   ##    ####   ##       ##     ## 
########  ##       ##     ##    ##    ######   ########  
##        ##       #########    ##    ##       ##   ##   
##        ##       ##     ##    ##    ##       ##    ##  
##        ######## ##     ##    ##    ######## ##     ## 
*/
function shakeScreen(repeatCount) {
  TweenMax.to($(imScene), 0.1, {
    repeat: repeatCount - 1,
    top: -10 + (1 + Math.random() * 5),
    left: -10 + (1 + Math.random() * 5),
    delay: 0.1,
    ease: Expo.easeInOut,
  });
  TweenMax.to($(imScene), 0.1, {
    top: 0,
    left: 0,
    delay: (repeatCount + 1) * 0.1,
    ease: Expo.easeInOut,
  });
}
function takeDamage() {
  hp -= 10;

  if (hp < 0) {
    hp = 0;
  }
  $(hpbar).css("width", hp + "%");
  $(hpText).text("HP : " + hp + "%");

  var obj = document.createElement("img");
  obj.className = "cracked-window";
  obj.src = "img/game/window-crack.png";

  if (hp === 0) {
    gameOver();
    obj.src = "img/game/dramatic-crack.png";
    $(imScene).append(obj);
  } else {
    TweenMax.to($(obj), 1, {
      alpha: 0,
      onComplete: function () {
        $(obj).remove();
      },
    });
    $(imScene).append(obj);
  }
}

function resetHP() {
  hp = 100;
  $(hpbar).css("width", hp + "%");
  $(hpText).text("HP : " + hp + "%");
}

function playerShoot() {
  if (laserSwordLoaded) {
    laserSwordLoaded = false;
    $(laserSword).remove();
    laserSword = createDisplayObject("img", "laser-sword-loaded");
    laserSword.src = "img/game/sword.png";
    $(imCanvas).append(laserSword);
    $(laserSword).css({ left: $(player).position().left + 36, bottom: 0 });
    shotSound.play();
    TweenLite.to($(laserSword), 1, {
      top: -50,
      ease: Linear.easeNone,
      onUpdate: function (a) {
        playerBulletCollision(a);
      },
      onUpdateParams: ["{self}"],
      onComplete: function () {
        $(laserSword).remove();
        setTimeout(function () {
          summonYoda();
        }, 10000);
      },
    });
  } else {
    var obj = createDisplayObject("div", "player-bullet");
    $(imCanvas).append(obj);
    $(obj).css({ left: $(player).position().left + 30, bottom: "30px" });
    shotSound.play();
    TweenLite.to($(obj), 1, {
      top: -50,
      ease: Linear.easeNone,
      onUpdate: function (a) {
        playerBulletCollision(a);
      },
      onUpdateParams: ["{self}"],
      onComplete: function () {
        $(obj).remove();
      },
    });
  }
}

function playerBulletCollision(obj) {
  var objPos = obj.target.position();
  if (
    objPos.left + 10 >= bossBounds[0] &&
    objPos.left + 10 <= bossBounds[0] + bossBounds[2]
  ) {
    if (objPos.top >= bossBounds[1]) {
      if (objPos.top <= bossBounds[1] + bossBounds[3]) {
        hitBoss(obj);
      }
    }
  }
}

function updatePlayerBounds() {
  /*x,y,w,h*/
  var pos = $(player).position();
  playerBounds = [pos.left, pos.top, playerHitboxW, playerHitboxH];
}
function summonYoda() {
  if (bossHP > 0 && !paused && !gameLost && bossSP > 0) {
    addDroid(1500);
    giveSword();
    // ieSound.play();
		useTheForceSound.play();
  } else if (paused && !gameLost && bossSP > 0 && bossHP > 0) {
    setTimeout(function () {
      summonYoda();
    }, 10000);
  }
}
function giveSword() {
  laserSword = createDisplayObject("img", "laser-sword-unpicked");
  laserSword.src = "img/game/sword.png";
  $(imCanvas).append(laserSword);
  bindSwordPickup();
}
function pickupSword() {
  if (playerBounds[0] < 200) {
    unBindSwordPickup();
    $(laserSword).remove();
    laserSword = createDisplayObject("img", "laser-sword-loaded");
    laserSword.src = "img/game/sword.png";
    $(player).append(laserSword);
    laserSwordLoaded = true;
  }
}
function hitPlayer() {
  takeDamage();
  shakeScreen(5);
  explosionSound.play();
}
/*
########   #######   ######   ######  
##     ## ##     ## ##    ## ##    ## 
##     ## ##     ## ##       ##       
########  ##     ##  ######   ######  
##     ## ##     ##       ##       ## 
##     ## ##     ## ##    ## ##    ## 
########   #######   ######   ###### 
*/

function deployBoss() {
  bossDeployed = true;
  killAllEnemies();
  gameSound.stop();
  $(".ammo").fadeOut();
  var obj = createDisplayObject("div", "boss"),
    img = document.createElement("img"),
    hp = createDisplayObject("span", "boss-hp"),
    sp = createDisplayObject("span", "boss-sp");
  img.src = "img/game/oldpc.png";
  bossDisplay = createDisplayObject("div", "boss-display");
  bossHitbox = createDisplayObject("div", "boss-hitbox");
  obj.appendChild(img);
  obj.appendChild(bossHitbox);
  obj.appendChild(bossDisplay);
  obj.appendChild(hp);
  obj.appendChild(sp);
  boss = obj;
  deployPlayer();
  unBindShoot();
  unBindReload();
  $("#scene").parallax("disable");
  TweenMax.staggerTo(
    $("#scene .layer"),
    6,
    { rotation: 3000, alpha: 0, ease: Circ.easeIn },
    0.4,
    function () {
      $(imCanvas).append(boss);
      winXPSound.play();
      bossHitboxW = $(bossHitbox).width();
      bossHitboxH = $(bossHitbox).height();
      $("#scene .layer").css({ rotation: 0 });
      $(".chromeplanet").hide();
      $("#scene").parallax("enable");
      TweenMax.staggerTo($("#scene .layer"), 1, { opacity: 1 }, 0.6);

      TweenMax.fromTo(
        $(boss),
        0.8,
        { top: 0, left: $(imScene).width() / 2 - 175 },
        {
          delay: 2,
          top: 200,
          left: $(imScene).width() / 2 - 175,
          onComplete: function () {
            TweenMax.to($(".boss-hp,.boss-sp"), 1, { opacity: 1 });
            moveBoss();
            bossShoot();
            updateBossBounds();
            bossSound.play();
            summonYoda();
          },
        }
      );
    }
  );
}

function deployPlayer() {
  var obj = createDisplayObject("div", "player");
  player = obj;
  $(imCanvas).prepend(player);
  playerHitboxW = $(player).width();
  playerHitboxH = $(player).height();
  TweenMax.fromTo(
    $(player),
    1,
    { bottom: -80, left: $(imScene).width() / 2 - 37 },
    {
      bottom: 20,
      left: $(imScene).width() / 2 - 37,
      onComplete: function () {
        bindPlayerMovement();
        bindPlayerShooting();
        updatePlayerBounds();
      },
    }
  );
}

function onBossReached() {
  bossReached = true;
  killAllEnemies();
  gameSound.stop();
  jabbaLaugh.play();
  $(".ammo, .score").fadeOut();
  resetHP();
  deployBoss();
}

function hitBoss(bullet) {
  if (bossShieldActive) {
    if ($(bullet.target).hasClass("laser-sword-loaded")) {
      bossTakeDamage(bullet);
      bossRemoveShield();
    } else {
      shieldAbsorb(bullet);
      bossDamageShield(bullet);
      return false;
    }
  } else {
    bossTakeDamage(bullet);
  }

  if (bossHP <= 0) {
    killBoss();
  }
}
function bossTakeDamage(bullet) {
  // addExplosion(bullet);
  addHitAnimation(bullet, "img", "shot", explosionImg);
  $(bullet.target).remove();
  bossHP -= 200;
  var divider = 50;
  explosionSound.play();
  TweenMax.to($(boss).find(".boss-hp"), 0.3, { width: bossHP / divider });
  bossStunned();
}
function bossDamageShield(bullet) {
  $(bullet.target).remove();
  bossSP -= 200;
  var divider = 50;
  TweenMax.to($(boss).find(".boss-sp"), 0.3, { width: bossSP / divider });
  if (bossSP <= 0) {
    bossRemoveShield();
  }
}
function getBossDirections() {
  return [
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * ($(imCanvas).width() - 350)),
    Math.random() * 1 + 1,
  ];
}
function moveBoss() {
  if (bossHP <= 0) return;
  var path = getBossDirections();
  TweenMax.to($(boss), 0.5, {
    delay: (bossSP <= 0) ? 0 : path[2],
    top: path[0],
    left: path[1],
    ease: Linear.easeNone,
    onUpdate: updateBossBounds,
    onComplete: function () {
      moveBoss();
    },
  });
}
function bossShoot() {
  var randTime = Math.round(Math.random() * 1000); // было 3000
  setTimeout(function () {
    if (!paused && !gameLost && bossHP > 0 && !bossIsStunned) {
      var bossBullet = createDisplayObject("div", "boss-bullet");
      $(imCanvas).append(bossBullet);
      TweenLite.fromTo(
        $(bossBullet),
        1,
        { rotation: 0, left: bossBounds[0], top: bossBounds[1] },
        {
          rotation: 360,
          left: playerBounds[0] + playerBounds[2] / 2,
          top: playerBounds[1] + playerBounds[3],
          onUpdate: bossBulletCollision,
          onUpdateParams: ["{self}"],
          ease: Linear.easeNone,
          onComplete: function () {
            $(bossBullet).remove();
          },
        }
      );

      //emo animation
      $(bossDisplay).addClass("boss-happy");
      setTimeout(function () {
        if (!gameLost) $(bossDisplay).removeClass("boss-happy");
      }, 1000);
    }
    if (bossHP > 0) {
      bossShoot();
    }
  }, randTime);
}
function bossSetShield() {
  if (bossHP <= 0 || bossSP <= 0) return;
  bossShieldActive = true;
  $(boss).addClass("boss-shield");
}
function bossRemoveShield() {
  console.log("THIS");
  bossShieldActive = false;
  surpriseSound.play();
  $(boss).removeClass("boss-shield");
}

function shieldAbsorb(e) {
  absorbSound.play();
  addHitAnimation(e, "img", "hit-absorbtion", shieldAbsorbtionImg);
  // var obj = createDisplayObject('img',"hit-absorbtion");
  // obj.src = "img/game/hit-absorbtion.png";
  // $(imCanvas).prepend(obj);
  // $(obj).css({top:$(e.target).position().top-100, left:$(e.target).position().left-50});
  // TweenMax.to($(obj),0.15,{rotation:360, scaleX:.2, scaleY:.2, alpha:0, ease:Linear.easeNone, onComplete: function(){
  // 	$(obj).remove();
  // }});
}

function bossStunned() {
  if (!bossIsStunned && !bossIsStunImmune) {
    bossIsStunned = true;
    var moveTween = TweenMax.getTweensOf($(boss))[0];
    moveTween.pause();
    // if(!$(bossDisplay).hasClass('boss-hit-animation') && !$(bossDisplay).hasClass('boss-angry-animation')){

    $(bossDisplay).addClass("boss-hit-animation");
    $(boss).addClass("boss-stunned");
    setTimeout(function () {
      $(bossDisplay).removeClass("boss-hit-animation");
      $(boss).removeClass("boss-stunned");
      if (bossHP > 0) {
        $(bossDisplay).addClass("boss-angry-animation");
        setTimeout(function () {
          $(bossDisplay).removeClass("boss-angry-animation");
          bossIsStunned = false;
          bossSetShield();
					if (bossSP <= 0) {
						bossIsStunImmune = true;
						setTimeout(function () {
							bossIsStunImmune = false;
						}, 2000);
					}
          if (!paused) moveTween.resume();
        }, (bossSP <= 0) ? 500 : 1000);
      }
    }, (bossSP <= 0) ? 1000 : 2000);
  }
}

function updateBossBounds() {
  /*x,y,w,h*/
  var pos = $(bossHitbox).offset();
	var margin = $(imScene).offset();
  bossBounds = [pos.left - margin.left, pos.top, bossHitboxW, bossHitboxH];
}

function bossBulletCollision(obj) {
  // console.log(obj);
  var objPos = obj.target.position();
  var i = 0;
  if (
    objPos.left + 10 >= playerBounds[0] &&
    objPos.left + 10 <= playerBounds[0] + playerBounds[2]
  ) {
    if (objPos.top >= playerBounds[1]) {
      if (objPos.top <= playerBounds[1] + playerBounds[3]) {
        i++;
        addHitAnimation(obj, "img", "shot", explosionImg);
        TweenLite.killTweensOf(obj.target);
        $(obj.target).remove();
        hitPlayer();
      }
    }
  }
}

function killBoss() {
  if (!$(bossDisplay).hasClass("boss-dead")) {
    $(bossDisplay).addClass("boss-dead");
    addCenterMessage(
      'VICTORY! <span style="font-size:22px">Press F5 to restart</span>',
      false
    );
    bossSound.stop();
    mkLaugh.play();
  }
}

function addHitAnimation(e, displayObj, objClass, url) {
  var obj = createDisplayObject(displayObj, objClass);
  obj.src = url;
  $(imCanvas).prepend(obj);
  if (e.type == "mousedown") {
    var posX = e.pageX - $(obj).width() / 2;
    var posY = e.pageY - $(obj).height();
  } else {
    var posX = $(e.target).position().left - $(obj).width() / 2;
    var posY = $(e.target).position().top - $(obj).height();
  }
  $(obj).css({ top: posY, left: posX });

  TweenMax.to($(obj), 0.15, {
    rotation: 360,
    scaleX: 2,
    scaleY: 2,
    alpha: 0,
    ease: Linear.easeNone,
    onComplete: function () {
      $(obj).remove();
    },
  });
}

/*
	##          ###    ##    ##  #######  ##     ## ######## 
	##         ## ##    ##  ##  ##     ## ##     ##    ##    
	##        ##   ##    ####   ##     ## ##     ##    ##    
	##       ##     ##    ##    ##     ## ##     ##    ##    
	##       #########    ##    ##     ## ##     ##    ##    
	##       ##     ##    ##    ##     ## ##     ##    ##    
	######## ##     ##    ##     #######   #######     ##    
	*/
$(".page-scene").on("dragstart", function (e) {
  e.preventDefault();
});
$(".page-scene").on("selectstart", function (e) {
  e.preventDefault();
});
$(".trashbin").on("click", function () {
  $(".bin1").show();
  $(".bin2").hide();
  $(this).css("cursor", "default");
  $(".clean-that-bin").text("THANKS!");
});

/*trooper*/
var talksArr = [
  "Don't you mess with me!",
  "WTF dude?",
  "Are you an IE user?",
  "Not gonna happen...",
  "Save the trees - uninstall IE",
  "You can try all day long :)",
  "What is your favorite movie?",
  `I know your IP, i will find you!`,
  "Just wait till robots take over the world...",
  "Go post a tweet or something",
  "You're so racist",
  "Well, this goes in circle",
];
var trooperIp;
$.getJSON("https://api.ipify.org?format=json", function (data) {
  trooperIp = data.ip;
  if (trooperIp) {
    talksArr[7] = `I know your IP (${trooperIp}), i will find you!`;
  }
});

phrase = 0;
$(".troopatalk").on("click", function () {
  $(this).fadeOut();
});
function allowDrop(e) {
  e.preventDefault();
}
function dropTrash(e) {
  $(".troopatalk").show();
  $(".troopatalk").text(talksArr[phrase]);
  phrase == talksArr.length - 1 ? (phrase = 0) : phrase++;
  e.preventDefault();
}

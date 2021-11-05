/************************************************/
/*                 GAME                         */
/************************************************/
	var imCanvas = $('.canvas'),
		imScene = $('.page-scene'),
		title = $('.title'),
		titleWrap = $('.titlewrap'),
		vol = 20,
		score = 0,
		ammo = $('.bullet').length,
		hpbar = $('.current-hp'),
		hpText = $('.hitpoints span'),
		username,
		hp = 100,
		paused = false,
		muted = false,
		soundsToLoad = 9,
		loadedSounds = 0,
		mfckScore = 0,
		excellentScore = 0,
		shotsMade = 0,
		targetsHits = 0,
		targetsMissed = 0,
		iconsArr,
		gameLost=false,
		crackedWindow=$('.cracked-window'),
		dev=false;
		$('#scene').parallax('enable');

	/* sounds */
	soundManager.defaultOptions = {
		autoLoad: true,
		multiShot: true,
		volume: vol,
		onload: function(){
	  		if(loadedSounds != soundsToLoad){
				loadedSounds++;
			}
			if(loadedSounds==soundsToLoad){
				TweenMax.to($('.game-preloader'),1,{alpha:0, onComplete: function(){
					$('.game-preloader').remove();
					mainMenu();//init
				}});
			}
		}
	}
	var shotSound,noammoSound,reloadSound,explosionSound,ie7Sound,ieSound,introSound,gameSound,surpriseSound,excellentSound,enemyBlasterSound,playerKilledSound;

	soundManager.setup({
		url: 'js/',
	  	preferFlash: false,
		debugMode: false,
		html5PollingInterval: 50,
		onready: function() {
			shotSound = 		soundManager.createSound({ 	url: 'sound/shot.mp3'	 								 });
			noammoSound = 		soundManager.createSound({ 	url: 'sound/noammo.mp3'									 });
			reloadSound = 		soundManager.createSound({ 	url: 'sound/reload.mp3'									 });
			explosionSound = 	soundManager.createSound({ 	url: 'sound/explosion.mp3'	 							 });
			ie7Sound = 			soundManager.createSound({ 	url: 'sound/oorah.mp3'	 								 });
			ieSound = 			soundManager.createSound({ 	url: 'sound/toasty.mp3'	 								 });
			introSound = 		soundManager.createSound({ 	url: 'sound/swtheme.mp3', 		stream: false 			 });
			gameSound = 		soundManager.createSound({ 	url: 'sound/dvtheme.mp3', 		stream: false, loops:999 });
			surpriseSound = 	soundManager.createSound({ 	url: 'sound/rand/surprise.mp3'	 						 });
			excellentSound = 	soundManager.createSound({ 	url: 'sound/rand/excellent.mp3'							 });
			enemyBlasterSound =	soundManager.createSound({ 	url: 'sound/enemyblaster.mp3'							 });
			playerKilledSound =	soundManager.createSound({ 	url: 'sound/playerkilled.mp3'							 });

			iconsArr = [[100, ,"ff"], [200, ,"op"], [200, ,"sf"], [100, ,"ns"], [150, ,"mx"], [50, ,"wtf"], [50, ,"wtf2"], [500, ieSound,"ie"], [1000, ie7Sound,"ie7"]];
		},
		ontimeout: function() {
			console.log('### SOUND ERROR ###');
		}
	});


/************************************************/
/*                 FUNCTIONS                    */
/************************************************/
	function pauseToggle(){
		if(!paused){
			paused=true;
			TweenMax.pauseAll();
			$('.pause-control').addClass('pc-paused');
		}else{
			paused=false;
			TweenMax.resumeAll();
			$('.pause-control').removeClass('pc-paused');
		}
	}

	function muteToggle(link){
		if(muted==true){
			muted=false;
			soundManager.unmute();
			$('.sound-control').removeClass('sc-muted');
		}else{
			muted=true;
			soundManager.mute();
			$('.sound-control').addClass('sc-muted');
		}
		if(link==true){
			muted=true;
			soundManager.mute();
			$('.sound-control').addClass('sc-muted');
		}
	}

	function gameOver(){
		gameLost = true;
		playerKilledSound.play();

		var obj = document.createElement('div');
		obj.className = "game-tint";
		$(imCanvas).append(obj);
		TweenMax.fromTo($(obj),2.8,{opacity:0},{opacity:1,onComplete:function(){
			TweenMax.to($(obj),5,{opacity:0});
			shakeScreen(35);
			addCenterMessage('GAME OVER',false);
			// postScore();
			$('.game-reload').fadeIn();
		}});
		// $(imScene).addClass('desaturate');
	}

	function createObj(){
		var obj = document.createElement('img');
		obj.className = "circle";
		$(imCanvas).append(obj);
		$(obj).on('dragstart',function(e){e.preventDefault()})
		var randSize = Math.round((Math.random()*$(obj).width())+$(obj).width()/3),
			xPos = Math.round(Math.random()*$(imCanvas).width()- $(obj).width()) ,
			yPos = $(imCanvas).height(),
			randIcon = Math.round(Math.random()*(iconsArr.length-1));
		if(xPos<0)xPos = 0;
		obj.score = iconsArr[randIcon][0];
		obj.deathSound = iconsArr[randIcon][1];
		obj.hostile = (Math.random()<0.5)?true:false;
		obj.dead = 0;
		obj.src = 'img/game/icons/'+randIcon+'.png';
		$(obj).css({
			top:yPos,
			left:xPos,
			width:randSize,
			height:randSize
		});

		var randTime = Math.round((Math.random()*6))+2,
			endPoint = -$(imCanvas).height()-$(obj).height();

 		obj.tween = TweenMax.to($(obj),randTime,{top:endPoint, ease:Linear.easeNone, onComplete: function(){
			obj.tween.kill();
			$(obj).remove();
			if(obj.dead===0)targetsMissed+=1;
			createObj();
		}});

		if(obj.hostile && gameLost !== true){
				setTimeout(function(){
					if(obj.dead === 0 && paused === false && gameLost !== true){
						obj.tween.pause();
						shootAtPlayer(obj);
					}
				}, Math.round(randTime/3*1000));
			}
	}

 	function shootAtPlayer(enemy){
 		var obj = document.createElement('img');
		obj.className = "enemy-shot";
		obj.src = "img/game/enemy-shot.png";
		$(imCanvas).append(obj);
		var	posX = $(enemy).position().left+$(enemy).width()/2;
		var	posY = $(enemy).position().top+$(enemy).height()/2;
		$(obj).css({top:posY, left:posX});
		TweenMax.to($(obj),.2,{scaleX: 1.5, scaleY: 1.5, left:$(imCanvas).width()/2,top:$(imCanvas).height()/2,onComplete:function(){

    		$(obj).remove();
		}})

		enemyBlasterSound.play();
		takeDamage();
		shakeScreen(5);
 		setTimeout(function() {
    		enemy.tween.play();
		}, 300);
 	}
 	function shakeScreen(repeatCount){
	   TweenMax.to($(imScene),0.1,{repeat:repeatCount-1, top:-10+(1+Math.random()*5), left:-10+(1+Math.random()*5), delay:0.1, ease:Expo.easeInOut});
	   TweenMax.to($(imScene),0.1,{top:0, left:0, delay:(repeatCount+1) * .1, ease:Expo.easeInOut});
	}

 	function takeDamage(){
 		hp-=10;
 		$(hpbar).css('width',hp+"%");
 		$(hpText).text('HP : '+hp+'%');

		var obj = document.createElement('img');
		obj.className = "cracked-window";
		obj.src = "img/game/window-crack.png";

 		if(hp===0){
 			gameOver();
 			obj.src = "img/game/dramatic-crack.png";
			$(imScene).append(obj);
 		}else{
 			TweenMax.to($(obj),1,{alpha:0, onComplete: function(){
				$(obj).remove();
			}});
			$(imScene).append(obj);
 		}
 	}

 	function resetHP(){
 		hp=100;
 		$(hpbar).css('width',hp+"%");
 		$(hpText).text('HP : '+hp+'%');
 	}

	function shoot(e){
		if(gameLost === true){return false;}
		if(ammo!=0 && !paused){
			if(e.target.className==='circle'){
				addExplosion(e);
				hit(e);
			}else{
				miss(e);
			}
			useAmmo();
		}else if(paused){
			pauseToggle();
		}else if(ammo===0){
			noammoSound.play();
			TweenMax.to($('.reload'),0.2,{alpha:0,onComplete:function(){
				TweenMax.to($('.reload'),0.2,{alpha:1});
			}})
		}
	}

	function hit(e){
		updateScore(e.target.score);
		animateScore(e.target);
		explosionSound.play();
		e.target.dead=1;
		targetsHits++;
		if(e.target.deathSound !== undefined){
			e.target.deathSound.play();
		}
		if(e.target.deathSound === ieSound){
			addDroid();
		}
		$(e.target).remove();
		e.target.tween.play();
	}

	function miss(e){
		addMiss(e);
		shotSound.play();
	}

	function addExplosion(e){
		var obj = document.createElement('img');
		obj.className = "shot";
		obj.src = "img/game/expl.png";
		$(imCanvas).prepend(obj);
		var	posX = $(e.target).position().left;
		var	posY = $(e.target).position().top;
		$(obj).css({top:posY, left:posX});
		TweenMax.to($(obj),0.15,{rotation:360, scaleX:2, scaleY:2, alpha:0, ease:Linear.easeNone, onComplete: function(){
			$(obj).remove();
		}});
	}
	function addMiss(e){
		var obj = document.createElement('img');
		obj.className = "miss";
		obj.src = "img/game/miss.png";
		$(imCanvas).prepend(obj);
		var	posX = (e.pageX - $(imCanvas).offset().left)-25;
		var	posY = (e.pageY - $(imCanvas).offset().top)-25;
		$(obj).css({top:posY, left:posX});
		TweenMax.to($(obj),1,{scaleX:.2, scaleY:.2, alpha:0, onComplete: function(){
			$(obj).remove();
		}});
	}

	function updateScore(n){
		score+=n;
		mfckScore+=n;
		excellentScore+=n;
		$('.score>span').text(score);
		if(mfckScore>=10000){
			mfckScore = 0;
			excellentScore = 0;
			surpriseSound.play();
    		animateTotalScore();
		}else if(excellentScore>=5000){
			excellentScore = 0;
			excellentSound.play();
    		animateTotalScore();
		}
	}

	function reloadAmmo(){
		ammo = $('.bullet').length;
		$('.bullet').removeClass('bullet-used');
		reloadSound.play();
		$('.reload').css({display:'none'});
	}

	function useAmmo(){
		ammo-=1;
		$('.bullet:nth-child('+(ammo+2)+')').addClass('bullet-used');
		if(ammo===0)$('.reload').css({display:'inline-block'});
		shotsMade++;
	}


    function animateScore(t){
    	var pos = $(t).position(),
    		obj = document.createElement('div');
		obj.className = "score-animation";
		$(obj).text("+"+t.score);
		$(imCanvas).prepend(obj);
		$(obj).css({top:pos.top, left:pos.left});
		TweenMax.to($(obj),1,{scaleX:2, scaleY:2, alpha:0, ease:Linear.easeNone, onComplete: function(){
			$(obj).remove();
		}});
    }

    function addDroid(){
    	var obj = document.createElement('img');
		obj.className = "droid";
		obj.src = "img/game/droid.png";
		$(imCanvas).prepend(obj);
		$(obj).css({bottom: -50, left:-80});
		setTimeout(function() {$(obj).remove()}, 700);
    }

    function animateTotalScore(){
    	var obj = $(".score").clone().prependTo($(imCanvas));
		TweenMax.to($(obj),1,{scaleX:10, scaleY:10, alpha:0, ease:Linear.easeNone, onComplete: function(){
			$(obj).remove();
		}});
    }

    function addCenterMessage(t,tween){
    	var obj = document.createElement('div');
		obj.className = "game-preloader";
		$(imCanvas).prepend(obj);
		$(imCanvas).css('font-size','18px');
		$(obj).text(t);
		if(tween==undefined){
			TweenMax.to($(obj),.5,{delay:1,scaleX:5, scaleY:5, alpha:0, ease:Linear.easeNone, onComplete: function(){
				$(obj).remove();
			}});
		}
    }



/************************************************/
/*                 START	           	        */
/************************************************/
$('.subm').on('click',function(){
	if($('.spaceship input').val()!==''){
		username = $('.spaceship input').val();
		$('.spaceship form').css('display','none');
	}
});

function startGame(gamerestart){
	if(gamerestart!==true){
		$('.ammo, .score').fadeIn();
		$('.holywars').fadeOut();
		for (var i = 0; i < 5; i++) {
			createObj();
		}
		/* EVENTS */
		$(imCanvas).on('mousedown',function(e){
			if (e.which===1) {
				shoot(e);
		    }
		});
		$(imCanvas).on('contextmenu',function(e){
			e.preventDefault();
			reloadAmmo();
			return false;
		});

		$('.reload').on('click',function(){
			reloadAmmo();
		});
		$('.pause-control').fadeIn();
		$('.pause-control').on('click', function(){
			pauseToggle();
		})
		$('.hitpoints').fadeIn();

		$('.game-reload').on('click', function(){
			restartGame();
			$('.game-reload').css('display','none');
		})
	}
}

function restartGame(){
	reloadAmmo();
	score = 0;
	mfckScore=0;
	excellentScore=0;
	updateScore(0);
	resetHP();
	if(paused===true)pauseToggle();
	shotsMade = 0;
	targetsHits = 0;
	targetsMissed = 0;
	gameLost=false;
	$('.game-preloader').remove();
	$('.cracked-window').remove();
}

function mainMenu(){
	if(dev===true){
		devStart();
		return false;
	}
	$(imScene).prepend(title);
	$('.holywars').css({display:'block'});
	$('.sound-control').fadeIn();
	$('.sound-control').on('click', function(){
		muteToggle();
	})

	var tl = new TimelineMax();
		TweenMax.set($(title), {transformPerspective:300,rotationX:25,y:500});
		TweenMax.set($(titleWrap), {y:70});
	tl.add(TweenMax.from($('.holywars'),1,{scaleY:.1,scaleX:.1, top:200}));
	tl.add(TweenMax.to($('.holywars'),1,{delay:1, top:0, scaleY:.5, scaleX:.5}));

		tl.add(TweenMax.to($(titleWrap),3,{y:-670,ease:Linear.easeNone,onComplete:function(){
			$('.spaceship').css({display:'block'});
			TweenMax.fromTo($('.spaceship'),1,{top:0, left:0, scaleY:.1, scaleX:.1}, {top:430, left:($(imCanvas).width()/2)-($('.spaceship').width()/2), scaleY:1, scaleX:1,onComplete:function(){
				$('.spaceship form').css('display','block');
			}});
		}}));
	var clicked=0;
	$('.spaceship').on('click',function(){
		// if(username===undefined)return false;
		if(clicked===0){
			clicked=1;
			$('.chromeplanet').css({display:'block',opacity:0});
			TweenMax.to($('.chromeplanet'),2,{right:30, alpha:1});
			$(title).fadeOut();
			TweenMax.to($('.spaceship'),3,{top:10, left:$(imCanvas).width(), rotation: -30,scaleY:.1, scaleX:.1, alpha:.2, onComplete:function(){
				$('.spaceship').remove();
				addCenterMessage('GET READY...');
				setTimeout(function() {addCenterMessage('SHOOT!');}, 1500);
				setTimeout(function() {
					introSound.stop();
					gameSound.play();
					startGame();
				}, 3000);
			}});
		}
	});
	introSound.play();
}

function devStart(){
	startGame();
	$('.chromeplanet').css({display:'block',opacity:0});
	TweenMax.to($('.chromeplanet'),2,{right:30, alpha:1});
	$('.sound-control').fadeIn();
	// gameOver();
}




/************************************************/
/*                 BOSS 	           	        */
/************************************************/
//in progress..






/************************************************/
/*                 END GAME	           	        */
/************************************************/





/************************************************/
/*                 LAYOUT STUFF       	        */
/************************************************/
$('.page-scene').on('dragstart',function(e){e.preventDefault();})
$('.page-scene').on('selectstart',function(e){e.preventDefault();})
$('.trashbin').on('click',function(){
	$('.bin1').show();
	$('.bin2').hide();
	$(this).css('cursor','default');
	$('.clean-that-bin').text('THANK YOU, LUKE!');
});
/*trooper*/
var talksArr = ["Don't you mess with me!", "WTF dude?", "So you're outdated as IE?", "Not gonna happen...", "Save the trees - uninstall IE", "You can try all day long :)", "What is your favorite movie?", "I know your IP and i'll find you!", "Just wait till robots take over the world, then we will see who fits that trash bin...", "Go post a tweet or something", "You're so racist", "Well, this goes in circle"],
	phrase = 0;
$('.troopatalk').on('click',function(){
	$(this).fadeOut();
})
function allowDrop(e){
	e.preventDefault();
}
function dropTrash(e){
	$('.troopatalk').show();
	$('.troopatalk').text(talksArr[phrase]);
	(phrase==talksArr.length-1) ? phrase = 0 : phrase++;
	e.preventDefault();
}
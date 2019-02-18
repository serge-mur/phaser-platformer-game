class StartMenu extends Phaser.Scene {
	constructor ()
	{
		super('startMenu');
	}
	preload ()
	{
		this.load.image('background', 'assets/background.png');
	}
	create ()
	{
		this.background = this.add.image(512, 384, 'background');

		this.nameText = this.add.text(240, 180, 'TOY GAME', { fontFamily: "Arial Black", fontSize: 95, color: "#eb7835" });
		this.nameText.setStroke('#66c3d0', 16).setShadow(2, 2, "#333333", 2, true, true);		

		this.startText = this.add.text(400, 400, 'Click to START', { fontFamily: "Comic Sans MS" ,fontSize: "32px", fill: "#5b5b5b" });
		
		isPlayerWin = false;

		this.input.once('pointerdown', function () 
		{
			window.focus();
			this.scene.start('play');

		}, this);

	}	
}

class Play extends Phaser.Scene
{
	constructor ()
	{
		super('play');
	}
	preload ()
	{
		this.load.tilemapTiledJSON('map', 'assets/map.json');
		this.load.spritesheet('tiles', 'assets/tiles.png', {frameWidth: 32, frameHeight: 32});//same name
		
		this.load.image('exit', 'assets/exit.png');

		this.load.image('player', 'assets/player.png');
		this.load.image('enemy', 'assets/enemy.png');
		this.load.image('enemyBoss', 'assets/enemyBoss.png');
	}
	create ()
	{
		this.background = this.add.image(512, 384, 'background');
		
		this.exit = this.physics.add.image(920, 160, 'exit');
		this.exit.body.allowGravity = false;

		let map = this.make.tilemap({ key: 'map' });

		let tiles = map.addTilesetImage('tiles');

		this.layer = map.createDynamicLayer('layer', tiles, 0, 0);
		
		// включает столкновения, исключает столкновения с плитами с индексами элементов массива
		this.layer.setCollisionByExclusion([-1]);

		this.player = this.physics.add.sprite(50, 600, 'player')
			.setBounce(0.2)
			.setCollideWorldBounds(true);
		
		this.physics.add.collider(this.player, this.layer);
		// death flag
		this.isPlayerAlive = true;

		// big boss enemy
		this.enemyBoss = this.physics.add.sprite(500, 500, 'enemyBoss');
		this.enemyBoss.body.setVelocity(300, 500).setBounce(1, 1).setCollideWorldBounds(true);
		this.physics.add.overlap(this.player, this.enemyBoss, this.killPlayer, null, this);
		// this.physics.add.collider(this.enemyBoss, this.layer);

		// other enemy
		let enemies = [
            [200, 500, 200, 716],
			[950, 580, 700, 580],	
			[370, 450, 570, 450],
			[150, 30, 150, 200],
			[300, 30, 300, 200],
			[450, 30, 450, 200],
            [600, 30, 600, 200],															
		];

		for (let i in enemies)
		{
			this.addEnemy(enemies[i][0],enemies[i][1], enemies[i][2], enemies[i][3]);
        }

		this.physics.add.overlap(this.player, this.exit, this.win, null, this);

		this.layer.setTileIndexCallback(33, this.collectCoin, this);
		//this.physics.add.overlap(this.player, this.layer);

		//kill ground of tilemap
		this.layer.setTileIndexCallback(11, this.killPlayer, this);

		// Привязка камеры
		// this.cameras.main.startFollow(this.player);

		this.cursors = this.input.keyboard.createCursorKeys();

		this.input.once('pointerdown', function () 
		{
			window.focus();
		}, this);


	}

	update ()
	{
		if (!this.isPlayerAlive)
		{
			return;
		}
		if (this.cursors.left.isDown)
		{
			this.player.body.setVelocityX(-160);
			this.player.flipX = true;
		}
		else if (this.cursors.right.isDown)
		{
			this.player.body.setVelocityX(160);
			this.player.flipX = false;
		}
		else
		{
			this.player.body.setVelocityX(0);
		}
		if (this.cursors.up.isDown && this.player.body.onFloor())
		{
			this.player.body.setVelocityY(-320);
		}
		if (this.cursors.down.isDown && !this.player.body.onFloor())
		{
			this.player.body.setVelocityY(220);
		}		

		this.enemyBoss.rotation += 0.01;

	}

	addEnemy (xStart, yStart, xEnd, yEnd) 
	{
		this.enemy = this.physics.add.sprite(xStart, yStart, 'enemy');
		this.enemy.setScale(.7);
		this.enemy.body.allowGravity = false;
	
		this.tweens.add({
			targets: [this.enemy],
			x: {
				getStart: () => xStart,
				getEnd: () => xEnd,
			},
			y: {
				getStart: () => yStart,
				getEnd: () => yEnd,
			},
			duration: Phaser.Math.FloatBetween(1000, 2000),
			yoyo: true,
			repeat: -1,
			callbackScope: this,
			// onComplete: function(tween)
			// {
			// 	console.log('move complete');
			// }			
		});

		this.physics.add.overlap(this.player, this.enemy, this.killPlayer, null, this);
		return true;
	}

	collectCoin (sprite, tile) 
	{
		this.layer.removeTileAt(tile.x, tile.y);
		console.log('coin collect!');
		return false;
	}

	killPlayer (sprite, tile) 
	{
		// flag to set player is dead
		this.isPlayerAlive = false;

		this.cameras.main.shake(500);
 
		this.time.delayedCall(250, function() {
			this.cameras.main.fade(250);
		}, [], this);

		this.time.delayedCall(500, function() {

			this.scene.start('gameOver');
				
		}, [], this);

		console.log('kill player!');

	}
	win (sprite, tile)
	{

		this.isPlayerAlive = false;

		isPlayerWin = true;

		this.time.delayedCall(250, function() {
			this.cameras.main.fade(250);
		}, [], this);

		this.time.delayedCall(500, function() {

			this.scene.start('gameOver');
				
		}, [], this);

	}

}

class GameOver extends Phaser.Scene {
	constructor ()
	{
		super('gameOver');
	}
	preload ()
	{
		
	}

	create ()
	{
		this.background = this.add.image(512, 384, 'background');

		if (isPlayerWin)
		{
			this.nameText = this.add.text(280, 180, 'You Win!', { fontFamily: "Arial Black", fontSize: 95, color: "#66c3d0" });
			this.nameText.setStroke('#eb7835', 16).setShadow(2, 2, "#333333", 2, true, true);	
		}
		else
		{
			this.nameText = this.add.text(240, 180, 'Game Over!', { fontFamily: "Arial Black", fontSize: 95, color: "#66c3d0" });
			this.nameText.setStroke('#eb7835', 16).setShadow(2, 2, "#333333", 2, true, true);
		}

		this.startText = this.add.text(400, 400, 'Click to reSTART', { fontFamily: "Comic Sans MS" ,fontSize: "32px", fill: "#5b5b5b" });
		
		this.input.once('pointerdown', function () 
		{
			window.focus();
			this.scene.start('play');

		}, this);

	}	
}

let config = {
	type: Phaser.CANVAS,
	width: 1024,
	height: 768,
	parent: 'blank-game',
	physics: {
	default: 'arcade',
		arcade: {
			gravity: { y: 350 },
			// debug: true
		}
	},	
	scene: [StartMenu, Play, GameOver ]
};

let game = new Phaser.Game(config);

// win flag
let isPlayerWin = false;

window.focus();
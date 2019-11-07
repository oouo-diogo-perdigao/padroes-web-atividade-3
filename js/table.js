//let / const
//classes

class Table{

	//#region Variaveis privadas
	/**
	 * Canvas
	 */
	#canvas;
	/**
	 * Areá de desenho
	 */
	#ctx;
	#cWidth;
	#cHeight;
	/**
	 * Matriz com os status das peças
	 */
	#table;
	/**
	 * Jogadas Restantes
	 */
	#movies;
	/**
	 * Jogador atual 1 = xis -1 = bol
	 */
	#jogador;
	#IA = false;

	#rank;
	//#endregion

	/**
	 * Função construtora do jogo
	 * @param {string} canvasId Id do canvas alvo sem o marcador #
	 * @param {int} width Largura do canvas
	 * @param {int} height Altura do canvas
	 */
	constructor(canvasId, width, height){
		let self = this;

		$("#"+canvasId).attr("width", width);
		$("#"+canvasId).attr("height", height);
		self.#cWidth = width;
		self.#cHeight = height;
		
		self.#canvas = document.getElementById(canvasId);
		self.#ctx = self.#canvas.getContext("2d");
		this.getRank();
		this.reset();
		
		/**
		 * Quando clicar chama play
		 */
		this.#canvas.onmousedown = function(e) {
			if (self.#movies>0) {
				self.play( parseInt(e.layerY*3/self.#cHeight), parseInt(e.layerX*3/self.#cWidth) );
			} else {
				self.reset();
			}
		};
	}

	getRank(){
		this.rank = new Ranking();
	}

	togleIA (enable){
		this.#IA = enable;
	}
	/**
	 * zera o tabuleiro
	 */
	reset () {
		this.#table = new Array(
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		);
		
		this.#movies = 9;
		this.#jogador = 1; //xis
		this.#movies = 9;
		this.showTable();
	}

	printMatriz (matriz) {
		for (let i = 0; i < 3; i++) {
			console.log(matriz[i][0]+" "+matriz[i][1]+" "+matriz[i][2]+"       "+i);
		}


	};

	/**
	 * Função principal de jogada
	 * @param {boolean} x linha 
	 * @param {boolean} y coluna
	 */
	play (x, y) {
		if (this.#movies) {
			//Movimento valido
			if (this.#table[x][y] == 0) {
				if (this.#jogador == 1) {	this.drawXis(x, y); this.#table[x][y] = 1; }
				else{						this.drawBol(x, y); this.#table[x][y] = -1; }

				this.#movies--;
				
				//Verificação de vitoria
				if (this.#movies <= 4 ) {
					let victory = this.wins();
					if (victory.winner) {
						this.#movies = 0;
						this.drawLine(victory.ini, victory.end);
						this.drawVictory(victory.winner);
						return;
					}
				}
				this.#jogador = -this.#jogador;
				//Jogadas do jogador completas
				
				
				//Jogadas da Ia, se habilitada, só joga com bola
				if (this.#IA) {
					let play = this.IAMiniMaxPoda(false);
					this.#movies--;
					if (this.#table[play[0]][play[1]] == 0) {
						if (this.#jogador == 1) { this.drawXis(play[0], play[1]); this.#table[play[0]][play[1]] = 1; }
						else{				this.drawBol(play[0], play[1]); this.#table[play[0]][play[1]] = -1; }
					}
					//Verificação de vitoria
					if (this.#movies <= 4 ) {
						let victory = this.wins();
						if (victory.winner) {
							console.warn("Vitoria de "+ victory.winner);
							this.#movies = 0;
							this.drawLine(victory.ini, victory.end);
							this.drawVictory(victory.winner);
						}
					}
					this.#jogador = -this.#jogador;

				}

			}
			else{ return; }
		}
	};
	
	//Funções de IA e calculo
	/**
	 * Uma IA de calculo de dados
	 * @param {boolean} turnXis 
	 */
	IAMiniMaxPoda ( turnXis ){
		// Matriz de Entrada que -1 bolinha, 0 vasio, 1 xis
		let jogadas = new Array(
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		);
		let calculo = new Array(
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		);
		
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				jogadas [i][j] = this.#table[i][j];
			}
		}
		
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (jogadas[i][j] == 0) {
					jogadas[i][j] = turnXis?1:-1;
					//printMatriz(jogadas);
					calculo[i][j] = -this.fitness(jogadas);
					//console.warn(calculo[i][j]);
					jogadas[i][j] = 0;
				}
				else{
					calculo[i][j] = turnXis?-99999:99999;
				}
			}
		}
		this.printMatriz(calculo);
		let retorno = new Array(0,0);
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (turnXis) {
					if ( calculo[i][j] == calculo[retorno[0]][retorno[1]] ) {
						if (Math.random() > 0.3) {
							retorno[0] = i;
							retorno[1] = j;
						}
					}
					else if ( calculo[i][j] > calculo[retorno[0]][retorno[1]] ) {
						retorno[0] = i;
						retorno[1] = j;
					}
				}
				else{
					if ( calculo[i][j] == calculo[retorno[0]][retorno[1]] ) {
						if (Math.random() > 0.3) {
							retorno[0] = i;
							retorno[1] = j;
						}
					}
					else if ( calculo[i][j] < calculo[retorno[0]][retorno[1]] ) {
						retorno[0] = i;
						retorno[1] = j;
					}
				}
			}
		}
		return retorno;
	};
	/**
	 * Funçao que gera o fitiness de um estado do jogo da velha
	 * @param {*} matriz + para xis e - para bol
	 */
	fitness (matriz){
		let fit = 0;
		let dois_x = 0;
		let um_x = 0;
		let duas_o = 0;
		let uma_o = 0;
		let qx, qo;//Quantidade de x, quantidade de bolinha
		
		//Calculo vertical
		for (let i = 0; i < 3; i++) {
			qx = 0;
			qo = 0;
			for (let j = 0; j < 3; j++) {
				if 		(matriz[i][j] == -1) 	{qx++;}
				else if (matriz[i][j] == 1) 	{qo++;}
			}
			if 		(qx == 2)	{ dois_x++; }
			else if (qx == 1) 	{ um_x++; }
			else if (qx == 3) 	{ return 99999; }
			if 		(qo == 2)	{ duas_o++; }
			else if (qo == 1) 	{ uma_o++; }
			else if (qo == 3) 	{ return -99999; }
		}
		
		//Calculo horizontal
		for (let i = 0; i < 3; i++) {
			qx = 0;
			qo = 0;
			for (let j = 0; j < 3; j++) {
				if 		(matriz[j][i] == -1) 	{qx++;}
				else if (matriz[j][i] == 1) 	{qo++;}
			}
			if 		(qx == 2)	{ dois_x++;}
			else if (qx == 1) 	{ um_x++;}
			else if (qx == 3) 	{ return 99999; }
			if 		(qo == 2)	{ duas_o++;}
			else if (qo == 1) 	{ uma_o++;}
			else if (qo == 3) 	{ return -99999; }
		}

		//Calculo diagonal 1
		qx = 0;
		qo = 0;
		for (let i = 0; i < 3; i++) {
			if 		(matriz[i][i] == -1) 		{qx++;}
			else if (matriz[i][i] == 1) 		{qo++;}
		}
		if 		(qx == 2)	{ dois_x++; }
		else if (qx == 1) 	{ um_x++; }
		else if (qx == 3) 	{ return 99999; }
		if 		(qo == 2) 	{ duas_o++; }
		else if (qo == 1) 	{ uma_o++; }
		else if (qo == 3) 	{ return -99999; }

		//Calculo diagonal 2
		qx = 0;
		qo = 0;
		for (let i = 0; i < 3; i++) {
			if (matriz [i][2-i] == -1) 	{qx++;}
			else if (matriz [i][2-i] == 1) {qo++;}
		}
		if 		(qx == 2)	{ dois_x++; }
		else if (qx == 1) 	{ um_x++; }
		else if (qx == 3) 	{ return 99999; }
		if 		(qo == 2) 	{ duas_o++; }
		else if (qo == 1) 	{ uma_o++; }
		else if (qo == 3) 	{ return -99999; }
		fit = (3*dois_x) + um_x -((3*duas_o) + uma_o);
		//console.log( dois_x, um_x, duas_o, uma_o, fit);
		
		return fit;
	};
	/**
	 * verificar quem vence
	 * @returns false to continue, "loose" to finish, "bol", "xis"
	 */
	wins(){
		let ret = {};
		ret.winner = false;
		ret.ini = new Array(-1,-1);
		ret.end = new Array(-1,-1);
		
		if (this.#movies == 0){ ret.winner = "loose"; } // Vitoria da velha

		for (let play = 1; play >= -1; play-=2) {
				 if (this.#table[0][0]==play && this.#table[0][1]==play && this.#table[0][2]==play){ ret.winner = play; ret.ini[0]=0;ret.ini[1]=0;ret.end[0]=0;ret.end[1]=2; console.log(1); }	//vitoria bolinha
			else if (this.#table[1][0]==play && this.#table[1][1]==play && this.#table[1][2]==play){ ret.winner = play; ret.ini[0]=1;ret.ini[1]=0;ret.end[0]=1;ret.end[1]=2; console.log(2); }
			else if (this.#table[2][0]==play && this.#table[2][1]==play && this.#table[2][2]==play){ ret.winner = play; ret.ini[0]=2;ret.ini[1]=0;ret.end[0]=2;ret.end[1]=2; console.log(3); }
			else if (this.#table[0][0]==play && this.#table[1][0]==play && this.#table[2][0]==play){ ret.winner = play; ret.ini[0]=0;ret.ini[1]=0;ret.end[0]=2;ret.end[1]=0; console.log(4); }
			else if (this.#table[0][1]==play && this.#table[1][1]==play && this.#table[2][1]==play){ ret.winner = play; ret.ini[0]=0;ret.ini[1]=1;ret.end[0]=2;ret.end[1]=1; console.log(5); }
			else if (this.#table[0][2]==play && this.#table[1][2]==play && this.#table[2][2]==play){ ret.winner = play; ret.ini[0]=0;ret.ini[1]=2;ret.end[0]=2;ret.end[1]=2; console.log(6); }
			else if (this.#table[0][0]==play && this.#table[1][1]==play && this.#table[2][2]==play){ ret.winner = play; ret.ini[0]=0;ret.ini[1]=0;ret.end[0]=2;ret.end[1]=2; console.log(7); }
			else if (this.#table[0][2]==play && this.#table[1][1]==play && this.#table[2][0]==play){ ret.winner = play; ret.ini[0]=0;ret.ini[1]=2;ret.end[0]=2;ret.end[1]=0; console.log(8); }
		}
		if (ret.winner) {
			if ('vibrate' in navigator) {
				// shake it up, baby
				navigator.vibrate([200, 250, 300]);
			}
		}
		return ret;
	};


	//Funções de desenho
	/**
	 * Desenha bol nas coordenadas estabelecidas
	 * @param {int} x Coordenada da matriz x
	 * @param {int} y Coordenada da matriz y
	 */
	drawBol (x, y){
		let partW = this.#cWidth/3;
		let partH = this.#cHeight/3;
		let minPart = partW<partH?partW:partH;
		let diameter = 0.8;
		
		//Desenha O
		this.#ctx.beginPath();
		this.#ctx.strokeStyle = "#0000ff";
		this.#ctx.arc(
			partW*(y+0) + (partW)*0.5, // center x
			(partH)*(x+0) + (partH)*0.5, // center y
			minPart * diameter/2,  // raio
			0, // start angle
			2 * Math.PI // end angle
		);
		this.#ctx.stroke();
	};
	/**
	 * Desenha xis nas coordenadas estabelecidas
	 * @param {int} x Coordenada da matriz x
	 * @param {int} y Coordenada da matriz y
	 */
	drawXis(x, y){
		let partW = this.#cWidth/3;
		let partH = this.#cHeight/3;
		let ar = 0.2;

		// desenha \
		this.#ctx.beginPath();
		this.#ctx.strokeStyle = "#00FF00";
		this.#ctx.moveTo( partW*(y+0) + (partW)*ar	, (partH)*(x+0) + (partH)*ar );
		this.#ctx.lineTo( partW*(y+1) - (partW)*ar	, (partH)*(x+1) - (partH)*ar );
		this.#ctx.stroke();
		// desenha /
		this.#ctx.moveTo( partW*(y+1) - (partW)*ar	, (partH)*(x+0) + (partH)*ar );
		this.#ctx.lineTo( partW*(y+0) + (partW)*ar	, (partH)*(x+1) - (partH)*ar );
		this.#ctx.stroke();
	};
	/**
	 * Desenha linha de vitoria
	 * @param {array bidimencional} point1 
	 * @param {array bidimencional} point2 
	 */
	drawLine(point1, point2){
		let partW = this.#cWidth/3;
		let partH = this.#cHeight/3;
		let ar = 0.5;
		// desenha linha
		this.#ctx.beginPath();
		this.#ctx.lineWidth = 10;
		this.#ctx.strokeStyle = "#FF0000";
		
		console.warn(point1);
		this.#ctx.moveTo(  partW*point1[1] + (partW)*ar,	partH*point1[0] + (partH)*ar );
		this.#ctx.lineTo(  partW*point2[1] + (partW)*ar,	partH*point2[0] + (partH)*ar );
		this.#ctx.stroke();
	};
	/**
	 * Desenha tabuleiro
	 */
	showTable (){
		//Limpa canvas
		this.#ctx.clearRect(0, 0, this.#cWidth, this.#cHeight);
		this.#ctx.lineWidth = 5;
		this.#ctx.strokeStyle = "#000000";

		//horizontal
		this.#ctx.beginPath();
		this.#ctx.moveTo(0, this.#cHeight/3);
		this.#ctx.lineTo(this.#cWidth, this.#cHeight/3);
		this.#ctx.stroke();

		this.#ctx.beginPath();
		this.#ctx.moveTo(0, this.#cHeight*2/3);
		this.#ctx.lineTo(this.#cWidth, this.#cHeight*2/3);
		this.#ctx.stroke();

		//vertical
		this.#ctx.beginPath();
		this.#ctx.moveTo(this.#cWidth/3, 0);
		this.#ctx.lineTo(this.#cWidth/3, this.#cHeight);
		this.#ctx.stroke();
		this.#ctx.beginPath();
		this.#ctx.moveTo(this.#cWidth*2/3, 0);
		this.#ctx.lineTo(this.#cWidth*2/3, this.#cHeight);
		this.#ctx.stroke();

	};

	drawVictory (winner){
		this.#ctx.globalAlpha = 0.7;
		this.#ctx.fillStyle = "black";
		this.#ctx.fillRect(0,0,this.#cWidth,this.#cHeight);
		this.#ctx.globalAlpha = 1.0;

		this.#ctx.fillStyle = "white";
		this.#ctx.textAlign = "center";
		
		this.#ctx.font = this.#cWidth/7+"px Arial";
		if (winner == 1) {
			this.#ctx.fillText("Xis Winner "+this.rank.addXis(), this.#canvas.width/2, this.#canvas.height/2);
		}
		else if(winner == -1) {
			this.#ctx.fillText("Bol Winner "+this.rank.addBol(), this.#canvas.width/2, this.#canvas.height/2);
		}
		else{
			this.rank.addLose();
			this.#ctx.fillText("All Lose "+this.rank.addLose(), this.#canvas.width/2, this.#canvas.height/2);
		}
	}
}
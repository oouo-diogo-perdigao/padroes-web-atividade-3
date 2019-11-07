'use strict';
//usado:
//let
//Classes
//Arrow functions
//Operador Spread

class Ranking {
	//#region Variaveis Constantes
	#dbName = 'ranking';
	#dbVer = 6;

	#tablename = 'rank'; //ordem importante
	#timeUpdateVehicleStatus = 10000;
	//#endregion

	//#region Variaveis privadas
	#id;
	#lg = new Array();
	#jsonLoad;
	#updateStatusSetTimeout = false; // Guarda o settimeout da próxima chamada ajax
	//#endregion

	/**
	 * Construtor da classe
	 * @param {string} idRecived
	 */
	constructor(idRecived) {
		if (!window.indexedDB) {
			console.log(
				'Seu navegador não suporta uma versão estável do IndexedDB. Alguns recursos não estarão disponíveis.'
			);
			return;
		}

		this.#id = idRecived;

		let today = new Date();
		let dd = String(today.getDate()).padStart(2, '0');
		let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		let yyyy = today.getFullYear();

		today = dd + '/' + mm + '/' + yyyy;
		this.#jsonLoad = {};
		this.#jsonLoad['day'] = today;
		this.#jsonLoad['xis'] = 0;
		this.#jsonLoad['bol'] = 0;
		this.#jsonLoad['lose'] = 0;
		this._readDB();
	}
	/**
	 * Guarda valor necessario na variavel this.#jsonLoad
	 * Se dado tiver no banco le, caso nao, le e cria o banco
	 * @returns {undefined}
	 */
	_readDB() {
		var self = this;

		let request = window.indexedDB.open(this.#dbName, this.#dbVer);
		request.onupgradeneeded = function(event) {
			event.target.transaction.abort(); //aborta operações desta requisição do banco
			self._init();
		};
		//banco existe resgata dados
		request.onsuccess = function(event) {
			let db = event.target.result;

			db
				.transaction(self.#tablename)
				.objectStore(self.#tablename)
				.getAll().onsuccess = event => self._readTable(event);
		};
	}

	/**
	 * Somnete cria o dados no banco e insere os valores para consultas futuras
	 * @returns {undefined}
	 */
	_init() {
		var self = this;
		let request = window.indexedDB.open(this.#dbName, this.#dbVer);
		request.onupgradeneeded = function(event) {
			let objectStore = event.target.result.createObjectStore(self.#tablename, { keyPath: 'day' });
			for (let i in self.#jsonLoad) {
				objectStore.createIndex(i, i, { unique: false }); //cria colunas
			}
		};
		request.onsuccess = function(event) {
			let db = event.target.result;
			let objectStore = db.transaction(self.#tablename, 'readwrite').objectStore(self.#tablename);
			objectStore.add(self.#jsonLoad); //cria colunas
			console.warn('iniciar ', self.#jsonLoad);
		};
	}

	/**
	 *
	 * @param {event} event
	 */
	_readTable(event) {
		let tempList = event.target.result;
		this.#jsonLoad = { ...tempList[0] };

		console.warn('Leu ', this.#jsonLoad);
	}

	_save() {
		$('#bol').val(this.#jsonLoad['bol']);
		$('#xis').val(this.#jsonLoad['xis']);

		console.warn('save');
		var self = this;
		let request = window.indexedDB.open(this.#dbName, this.#dbVer);
		request.onsuccess = function(event) {
			let db = event.target.result;
			let objectStore = db.transaction(self.#tablename, 'readwrite').objectStore(self.#tablename);

			console.warn(self.#jsonLoad);

			objectStore.put(self.#jsonLoad); //cria colunas
			console.warn('Salvo ', self.#jsonLoad);
		};
	}

	addXis() {
		this.#jsonLoad['xis']++;
		this._save();
		return this.#jsonLoad['xis'];
	}
	addBol() {
		console.warn(this.#jsonLoad);
		this.#jsonLoad['bol']++;
		console.warn(this.#jsonLoad['bol']);
		this._save();
		return this.#jsonLoad['bol'];
	}
	addLose() {
		this.#jsonLoad['lose']++;
		this._save();
		return this.#jsonLoad['lose'];
	}
}

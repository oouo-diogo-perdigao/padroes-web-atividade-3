//Utilizando uma API de Geolocalização para pegar a cidade e se estiver no celular pegar o bairro
if ('geolocation' in navigator) {
	//console.log("geolocation Esta disponivel");
	navigator.geolocation.getCurrentPosition(function(p) {
		const url =
			'https://nominatim.openstreetmap.org/reverse?lat=' +
			p.coords.latitude +
			'&lon=' +
			p.coords.longitude +
			'&format=jsonv2';
		let request = new XMLHttpRequest();
		request.onload = function(e) {
			let add = request.response['address']['city'];
			//console.warn(p.coords.accuracy);
			if (p.coords.accuracy <= 500) {
				add += ' - ' + request.response['address']['suburb'];
			}
			$('#cidade').val(add);
		};
		request.addEventListener('error', function(e) {
			console.log(e);
		});
		request.responseType = 'json';
		request.open('GET', url);
		request.send();
	});
}

//Utilizando uma API de canvas para se criar um jogo da velha, com uma IA inclusa para nao se jogar sozinho
let classTable;
$(document).ready(function() {
	let width = $('body').width() > 400 ? 400 : $('body').width();
	let height = $('body').height() > 400 ? 400 : $('body').height();
	classTable = new Table('myCanvas', width, height);
	//$("#servidor").append(width+" "+height);
	$('#IA').click(function() {
		classTable.togleIA($(this).is(':checked'));
	});
	$('#IA').trigger('click');

	/**
	 * Mostra Ultimo record Registrado
	 */
	function showRecord() {
		let competidor = localStorage.getItem('competidor');
		let cidade = localStorage.getItem('cidade');
		let email = localStorage.getItem('email');
		let bol = localStorage.getItem('bol');
		let xis = localStorage.getItem('xis');
		if (competidor) {
			$('#lastRecord').html(
				`Competidor: ${competidor}<br/>
				Email: ${email}<br/>
				Cidade: ${cidade}<br/>
				Vitoria Bola: ${bol}<br/>
				Vitoria Xis: ${xis}<br/>
				`
			);
		} else {
			$('#lastRecord').html('Ainda não existem records');
		}
	}

	$('#myform').submit(function(event) {
		event.preventDefault();
		localStorage.setItem('competidor', $('#competidor').val());
		localStorage.setItem('email', $('#email').val());
		localStorage.setItem('cidade', $('#cidade').val());
		localStorage.setItem('enableIA', $('#IA:checked').length > 0 ? true : false);
		localStorage.setItem('bol', $('#bol').val());
		localStorage.setItem('xis', $('#xis').val());
		showRecord();
	});
	showRecord();
});

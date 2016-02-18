// //Função para manipular arquivo CSV
// var data;
// function handleFileSelect(evt) {
//   alert("Iniciando conversão");
//   var file = evt.target.files[0];
//   Papa.parse(file, {
//     header: true,
//     dynamicTyping: true,
//     complete: function(results) {
//       data = results;
//       console.log(data);
//     }
//   });
// }

$( document ).ready(function() {
  $(".sidebar-brand").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
    $("#wrapper").toggleClass("untoggled");
  });

  // var slider = document.getElementById('slider');
  // noUiSlider.create(slider, {
  //   start: [20, 80],
  //   range: {
  //     'min': 0,
  //     'max': 100
  //   }
  // });

  // $("#test").on('click', function() {
  //   alert("fodase");
  // });
  //
  // //Handle que observa se a div muda
  // // $("#csv-file").on('change', function() {
  // //   alert("fodase");
  // // });
  // $('input[type=file]').parse({
  // config: {
  //              complete: function(results) {
  //                   console.log("Parse results:", results.data);
  //                  }
  //              }
  //            });
  //Indica página principal como homepage no cabeçalho
  pageInd('1');
  console.log( "ready!" );
});

//Função responsável por indicar o endereço da página logo após escrita LightDNA System
function pageInd(listID){
  switch(listID) {
      case '1':
          $('#pageIndicator').html("<i class=\"fa fa-home fa-fw\"></i> Home <i class=\"fa fa-chevron-right\"></i> <span class=\"menu-icon fa fa-laptop\"></span> Principal</a>");
          // $(".dial").knob();
          break;
      case '2':
          $('#pageIndicator').html("<i class=\"fa fa-home fa-fw\"></i> Home <i class=\"fa fa-chevron-right\"></i> <span class=\"menu-icon fa fa-list-ul\"></span> Lista de Luminárias</a>");
          break;
      case '3':
          $('#pageIndicator').html("<i class=\"fa fa-home fa-fw\"></i> Home <i class=\"fa fa-chevron-right\"></i> <span class=\"menu-icon fa fa-clock-o\"></span> Relógio</a>");
          break;
      case '4':
          $('#pageIndicator').html("<i class=\"fa fa-home fa-fw\"></i> Home <i class=\"fa fa-chevron-right\"></i> <span class=\"menu-icon fa fa-cog\"></span> Configurações</a>");
          break;
      case '5':
          $('#pageIndicator').html("<i class=\"fa fa-home fa-fw\"></i> Home <i class=\"fa fa-chevron-right\"></i> <span class=\"menu-icon fa fa-bolt\"></span> Potência</a>");
          break;
      case '6':
          $('#pageIndicator').html("<i class=\"fa fa-home fa-fw\"></i> Home <i class=\"fa fa-chevron-right\"></i> <span class=\"menu-icon fa fa-bolt\"></span> Aparência</a>");
          break;
      case '7':
          $('#pageIndicator').html("<i class=\"fa fa-home fa-fw\"></i> Home <i class=\"fa fa-chevron-right\"></i> <span class=\"menu-icon fa fa-user\"></span> Usuários</a>");
          break;
      case '8':
          $('#pageIndicator').html("<i class=\"fa fa-home fa-fw\"></i> Home <i class=\"fa fa-key\"></i> Alterar a senha</a>");
          break;
      case '9':
          $('#pageIndicator').html("<i class=\"fa fa-home fa-fw\"></i> Home <i class=\"fa fa-chevron-right\"></i> <span class=\"menu-icon fa fa-tachometer\"></span> Controle</a>");
          break;
      case '14':
          $('#pageIndicator').html("<i class=\"fa fa-home fa-fw\"></i> Home <i class=\"fa fa-chevron-right\"></i> <span class=\"menu-icon fa fa-info\"></span> Sobre</a>");
          break;
      default:
          console.log("Opção de menu desconhecida!!");
  }
}

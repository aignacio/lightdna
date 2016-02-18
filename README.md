[Desenvolvido por]: Ânderson Ignácio da Silva
Interface 2.0 para o sistema de iluminação LIGHTDNA;


Atenção:
[EXECUÇÃO]:
Ao clonar o repositório:
sudo npm install -g - Instala as dependências do back-end
bower install - Instala as dependências do front-end
gulp - Compila a interface e executa o arquivo principal (server.js) para inicia
r o servidor;

Abrir o navegador no seguinte endereço:
localhost:8888

[DESCRIÇÃO]:
[Diretórios]:
dist - Diretório dos arquivos de saída compilados (os quais rodam no navegador);
src - Diretório de desenvolvimento de código;
node_modules - Diretório com os módulos do node;
[Arquivos]:
bower.json - Arquivo de dependências do bower (front-end);
package.json - Arquivo de dependência do node (back-end);
.bowerrc - Arquivo que indica ao bower onde instalar os programas do front-end;
gulfile.js - Arquivo que contém as tarefas do gulp-watch;
server.js - Arquivo principal da aplicação web back e front end;


[GULP]:
O gulp é um automatizador de tarefas para javascript, todas as suas dependências
tem de serem inclusas no package.json. Para criar uma tarefa no gulp deve-se uti
lizar a seguinte sintaxe:

gulp.task('nome da tarefa', function() {
    return gulp.src('caminho de arquivos')
      .pipe(gulp.dest('destino de arquivos');
});

A tarefa 'default' do gulp desenvolvido irá 'buildar' todo o projeto na pasta 'd
ist' e irá executa a tarefa 'watch' a qual observa se algum dos arquivos da past
a 'src/' foram modificados e re-compila o projeto (na verdade só executa a taref
a específica para atualizar o 'dist'), nesta tarefa 'default' também roda o 'nod
emon' que é o executor continuo do node principal(server.js), ou seja, caso esse
 arquivo seja alterado, o nodemon reinicia o server.js;

O gulp desenvolvido faz um 'minify' de todos os .css e .js, tornando o arquivo f
inal mais leve para rodar, ele também possui um analisador de sintaxe javascript
'js-hint' o qual roda antes de compilar pra ver senão há erros de sintaxe js;

[HTML]:
A diretiva <!-- STYLES --> localizada no arquivo 'src/index.html' gera um arquiv
o de saída 'dist/lib/css/main.min.css ' contém todos os css inclusos no projeto;

A diretiva <!-- SCRIPTS --> localizada no arquivo 'src/index.html' gera um  arqu
ivo de saída 'dist/lib/js/main.min.js ' contém todos os js inclusos no projeto;

Isto simplifica o arquivo final que se localiza no diretório dist;

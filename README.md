<h1 align="center">
  <img alt="Fastfeet" title="Fastfeet" src=".github/logo.png" width="300px" />
</h1>

<p>Projeto backend do desafio do bootcamp</p>


## Rodando o projeto (desenvolvimento)

1 - Para rodar o projeto e realizar os testes, use os comandos abaixo.

2 - Crie um .env preenchendo as variáveis de ambiente se baseando no arquivo `.env-example`.

3 - Rodar o projeto

```bash
# Instalar dependencias
$ yarn install

# Criar as tabelas e adicionar usuario padrão admin
$ yarn sequelize db:migrate
$ yarn sequelize db:seed:all

# Start do projeto
$ yarn dev

# Start da fila, redis
$ yarn queue

```

4 - Rotas no arquivo ``insominia\insomnia.json ``, importar para o insomina caso queira fazer somente as requisições.



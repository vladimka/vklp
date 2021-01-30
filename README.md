### VKLP
![Version](https://img.shields.io/badge/version-0.0.4-blue)
![Status](https://img.shields.io/badge/status-in%20-dev-green)

VKLP это модульный юзербот для вконтакте

## Оглавление
1. [Установка и запуск](#установка)
2. [Модули](#модули)
3. [Команды основного модуля - basic](#команды)

## Установка

1. Клонируем репозиторий

```shell script
git clone https://github.com/vladimka/vklp.git
```

2. На этом [сайте](https://vkhost.github.io) получаем токен `Kate Mobile`

3. Вставляем токен от вк в файл `config.json` в поле `token`

4. Устанавливаем зависимости

```shell script
npm i
```

5. Запускаем!!!

```shell script
node index
```

## Модули

Модули - сильнейщая часть этого бота. Вы можете сами написать модуль со своими командами для него.
Для примера создадим файл example_module.js в папке module (не путать с node_modules) и напишем такой код

```js
module.exports = [
  {
    name : 'example',
    regexp : /пример/i,
    async handler(ctx){
      await ctx.success('wow');
    }
  }
]
```

`module.exports` - массив команд нашего модуля<br/>
`name` - имя команды (нигде не используется в самом боте)<br/>
`regexp` - регулярное выражение по которому будет вызываться наша команда<br/>
`async handler(ctx){ ... }` - код команды

И чтобы наш модуль теперь заработал, надо в файле `config.json` в массиве modules добавить имя нашего модуля (без .js)

## Команды

\<prefix\> пинг - пинг<br/>
\<prefix\> жс \<code\> - выполнения жабаскрипт кода<br/>
\<prefix\> тест - тестовая команда<br/>
\<prefix\> инфо - информация о боте<br/>
\<prefix\> настройки - настройки бота<br/>
\<prefix\> настройки \<id\> \<value\> - изменение значения настройки<br/>
\<prefix\> дд - удаление сообщений<br/>
\<prefix\> ~префикс \<new_prefix\> - изменить префикс<br/>
\<prefix\> модули - выводит список всех ваших модулей
\<prefix\> +модуль \<moduleName\> - включает модуль
\<prefix\> -модуль \<moduleName\> - отключает модуль
### VKLP
![Version](https://img.shields.io/badge/version-0.0.3-blue)

VKLP это модульный юзербот для вконтакте

## Установка

1. Клонируем репозиторий

```shell script
git clone https://github.com/vladimka/lpbot.git
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

## Команды основного модуля - basic

\<prefix\> пинг - пинг<br/>
\<prefix\> жс \<code\> - выполнения жабаскрипт кода<br/>
\<prefix\> тест - тестовая команда<br/>
\<prefix\> инфо - информация о боте<br/>
\<prefix\> настройки - настройки бота<br/>
\<prefix\> настройки \<id\> \<value\> - изменение значения настройки<br/>
\<prefix\> дд - удаление сообщений<br/>
\<prefix\> ~префикс \<new_prefix\> - изменить префикс<br/>
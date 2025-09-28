/** @type {import('@vue/cli-service').ProjectOptions} */
module.exports = {
  devServer: {
    port: process.env.VUE_APP_PORT || 8080,
    allowedHosts: "all", // Разрешаем все хосты
    historyApiFallback: true,
    client: {
      webSocketURL: {
        port: process.env.WS_PORT || 0, // Необходимо для корректной работы на Railway
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*", // Разрешаем CORS запросы
    }
  },
  // Отключаем TypeScript проверку на этапе сборки, чтобы решить проблемы с зависимостями
  transpileDependencies: true,
  parallel: false,
  lintOnSave: false,
  // Указываем точку входа явно
  pages: {
    index: {
      // Точка входа для страницы
      entry: 'src/main.ts',
      // Исходный шаблон
      template: 'public/index.html',
      // Выходной файл
      filename: 'index.html',
      // Заголовок из шаблона
      title: 'COMANAGER',
    },
  }
}
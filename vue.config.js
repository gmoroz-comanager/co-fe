/** @type {import('@vue/cli-service').ProjectOptions} */
module.exports = {
  devServer: {
    port: process.env.VUE_APP_PORT || 8080
  },
  // Отключаем TypeScript проверку на этапе сборки, чтобы решить проблемы с зависимостями
  transpileDependencies: true,
  parallel: false,
  lintOnSave: false,
  // Указываем точку входа явно
  pages: {
    index: {
      // Точка входа для страницы
      entry: 'src/main.js',
      // Исходный шаблон
      template: 'public/index.html',
      // Выходной файл
      filename: 'index.html',
      // Заголовок из шаблона
      title: 'COMANAGER',
    },
  }
}
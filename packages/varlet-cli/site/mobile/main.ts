import { createApp } from 'vue'
import config from '@config'
import routes from '@mobile-routes'
import Varlet from '@varlet/ui'
import { createRouter, createWebHashHistory } from 'vue-router'
import { inIframe, isPhone } from '../utils'
import App from './App.vue'
import '@varlet/touch-emulator'
import '@varlet/ui/es/style'
import { install } from '@tdx/base-core'

const redirect = config?.mobile?.redirect
const defaultLanguage = config?.defaultLanguage

redirect &&
  routes.push({
    path: '/:pathMatch(.*)',
    redirect,
  })

routes.push({
  path: '/home',
  component: () => import('./AppHome.vue'),
})

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: (to: any, from: any, savedPosition: any) => savedPosition || { left: 0, top: 0 },
  routes,
})

router.beforeEach((to: any) => {
  const { path, hash, query } = to
  // const language = query.language ?? defaultLanguage
  const language = defaultLanguage
  const replace = query.replace

  if (!isPhone() && !inIframe()) {
    window.location.href = `./#/${language}${path}`
  }

  if (!isPhone() && inIframe()) {
    try {
      // @ts-ignore
      window.parent.onMobileRouteChange(path, language, replace, hash)
    } catch (e) {
      console.log(e)
    }
  }

  // @ts-ignore
  if (window._hmt) {
    if (to.path) {
      // @ts-ignore
      window._hmt.push(['_trackPageview', `/#${to.fullPath}`])
    }
  }
})

var app = createApp(App)
window.$app = app
window.i18n_message = {
  en: {
    MUI: window.i18n_MUI_en || {},
    Common: window.i18n_Common_en || {},
    Field: window.i18n_Field_en || {},
    F10: window.i18n_F10_en || {},
    Financials: window.i18n_Financials_en || {},
    FuncField: window.i18n_FuncField_en || {},
    Indicator: window.i18n_Indicator_en || {},
    Login: window.i18n_Login_en || {},
    Market: window.i18n_Market_en || {},
    Mine: window.i18n_Mine_en || {},
    Mixed: window.i18n_Mixed_en || {},
    StockQuotes: window.i18n_StockQuotes_en || {},
    System: window.i18n_System_en || {},
    Trade: window.i18n_Trade_en || {},
    Watchlist: window.i18n_Watchlist_en || {},
  },
  'zh-Hant': {
    MUI: window.i18n_MUI_zh_Hant || {},
    Common: window.i18n_Common_zh_Hant || {},
    Field: window.i18n_Field_zh_Hant || {},
    F10: window.i18n_F10_zh_Hant || {},
    Financials: window.i18n_Financials_zh_Hant || {},
    FuncField: window.i18n_FuncField_zh_Hant || {},
    Indicator: window.i18n_Indicator_zh_Hant || {},
    Login: window.i18n_Login_zh_Hant || {},
    Market: window.i18n_Market_zh_Hant || {},
    Mine: window.i18n_Mine_zh_Hant || {},
    Mixed: window.i18n_Mixed_zh_Hant || {},
    StockQuotes: window.i18n_StockQuotes_zh_Hant || {},
    System: window.i18n_System_zh_Hant || {},
    Trade: window.i18n_Trade_zh_Hant || {},
    Watchlist: window.i18n_Watchlist_zh_Hant || {},
  },
  'zh-Hans': {
    MUI: window.i18n_MUI_zh_Hans || {},
    Common: window.i18n_Common_zh_Hans || {},
    Field: window.i18n_Field_zh_Hans || {},
    F10: window.i18n_F10_zh_Hans || {},
    Financials: window.i18n_Financials_zh_Hans || {},
    FuncField: window.i18n_FuncField_zh_Hans || {},
    Indicator: window.i18n_Indicator_zh_Hans || {},
    Login: window.i18n_Login_zh_Hans || {},
    Market: window.i18n_Market_zh_Hans || {},
    Mine: window.i18n_Mine_zh_Hans || {},
    Mixed: window.i18n_Mixed_zh_Hans || {},
    StockQuotes: window.i18n_StockQuotes_zh_Hans || {},
    System: window.i18n_System_zh_Hans || {},
    Trade: window.i18n_Trade_zh_Hans || {},
    Watchlist: window.i18n_Watchlist_zh_Hans || {},
  },
}
install(app, { debug: true })

app.config.productionTip = false
app.config.globalProperties.$app = app
app.use(router).use(Varlet).mount('#app')

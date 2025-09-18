<template>
  <div style="position: relative">
    <header>
      <var-app-bar class="app-bar" title-position="left" :title="bigCamelizeComponentName">
        <template #left>
          <var-button
            v-if="showBackIcon"
            style="margin-right: 6px"
            text
            round
            @click="back"
            color="transparent"
            text-color="#fff"
          >
            <var-icon name="chevron-left" class="arrow-left" style="margin-top: 1px" />
          </var-button>
          <var-button
            v-if="!showBackIcon && github"
            style="margin-left: 2px; margin-right: 6px"
            text
            round
            color="transparent"
            text-color="#fff"
            @click="toGithub"
          >
            <var-icon name="github" class="github" style="margin-top: 1px" />
          </var-button>
        </template>
        <template #right>
          <var-button
            v-if="zbbMenu.length > 1"
            class="theme-button"
            text
            color="transparent"
            text-color="#fff"
            @click.stop="handleZbbButtonClick"
          >
            <var-icon name="account-circle" :size="28" class="palette" />
            <var-icon name="chevron-down" class="arrow-down" />
          </var-button>
          <var-button
            v-if="themes.length > 1"
            class="theme-button"
            text
            color="transparent"
            text-color="#fff"
            @click.stop="handleThemeButtonClick"
          >
            <var-icon name="palette" :size="28" class="palette" />
            <var-icon name="chevron-down" class="arrow-down" />
          </var-button>
          <var-button
            v-if="languages"
            class="i18n-button"
            text
            color="transparent"
            text-color="#fff"
            @click.stop="handleLanguageButtonClick"
          >
            <var-icon name="translate" class="i18n" />
            <var-icon name="chevron-down" class="arrow-down" />
          </var-button>
        </template>
      </var-app-bar>
    </header>
    <div class="router-view__block">
      <router-view />
    </div>

    <transition name="site-menu">
      <div class="settings var-elevation--3" v-if="showMenu">
        <var-cell
          v-for="(value, key) in nonEmptyLanguages"
          :key="key"
          class="mobile-language-cell"
          :class="[language === key && 'mobile-language-cell--active']"
          v-ripple
          @click="changeLanguage(key)"
        >
          {{ value }}
        </var-cell>
      </div>
    </transition>

    <transition name="site-menu">
      <div class="theme-settings var-elevation--3" v-if="showThemeMenu">
        <var-cell
          v-for="t in themes"
          :key="t.value"
          class="mobile-theme-cell"
          :class="[currentMobileTheme === t.value && 'mobile-theme-cell--active']"
          v-ripple
          @click="toggleTheme(t.value)"
        >
          {{ t[language] }}
        </var-cell>
      </div>
    </transition>
    <transition name="site-menu">
      <div class="zbbmenu-settings var-elevation--3" v-if="showZbbMenu">
        <var-cell
          v-for="t in zbbMenu"
          :key="t.value"
          class="mobile-theme-cell"
          :class="[currentZbb === t.value && 'mobile-theme-cell--active']"
          v-ripple
          @click="toggleZbb(t.value)"
        >
          {{ t['name'] }}
        </var-cell>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, type ComputedRef, type Ref } from 'vue'
import config from '@config'
import { getBrowserTheme, getMobileIndex, setTheme, watchLang, watchTheme, type Theme } from '@varlet/cli/client'
import { pascalCase } from '@varlet/shared'
import { useRoute } from 'vue-router'
import { inIframe, isPhone, removeEmpty } from '../utils'

export default defineComponent({
  setup() {
    const bigCamelizeComponentName: Ref<string> = ref('')
    const route = useRoute()
    const showBackIcon: Ref<boolean> = ref(false)
    const showMenu: Ref<boolean> = ref(false)
    const showThemeMenu: Ref<boolean> = ref(false)
    const language: Ref<string> = ref('')
    const languages: Ref<Record<string, string>> = ref(config?.mobile?.header?.i18n ?? {})
    if (languages.value['en-US']) delete languages.value['en-US']
    if (languages.value['zh-CN']) delete languages.value['zh-CN']

    const themes: Ref<Record<string, any>[]> = ref(config?.mobile?.header?.themes ?? {})
    const nonEmptyLanguages: ComputedRef<Record<string, string>> = computed(() => removeEmpty(languages.value))
    const redirect = config?.mobile?.redirect ?? ''
    const github: Ref<string> = ref(config?.mobile?.header?.github ?? '')
    const darkMode: Ref<string> = ref(config?.mobile?.header?.darkMode ?? '')
    const currentTheme = ref(getBrowserTheme())
    const currentMobileTheme = ref(window.localStorage.getItem('color') || 'red')
    const showZbbMenu: Ref<boolean> = ref(false)
    const zbbMenu: Ref<Record<string, any>[]> = ref(config?.mobile?.header?.zbbMenu ?? '')
    const currentZbb: Ref<string> = ref(window.localStorage.getItem('SeniorEditionFlag') || '0')
    const currentMobileLanguage = ref(window.localStorage.getItem('langKey') || 'zh-Hans')
    const showLanguageMenu = ref(false)
    const changeLanguage = (lang: string) => {
      // 更新语言值
      language.value = lang
      // 关闭菜单
      showMenu.value = false

      // 构建新的URL参数
      const urlParams = new URLSearchParams({
        color: currentMobileTheme.value,
        language: language.value,
        langKey: language.value,
        replace: route.query.replace as string,
      })

      // 更新URL
      window.location.href = `${getMobileIndex()}#${route.path}?${urlParams.toString()}`

      // 保存语言设置到本地存储
      window.localStorage.setItem('langKey', language.value)
      // // 处理iframe场景的刷新
      if (!isPhone() && inIframe()) {
        // 刷新iframe
        window.parent.frames['mobile'].location.reload(true) // 滚动到指定菜单位置
        window.top?.scrollToMenu?.(redirect.slice(1))
      } else {
        window.location.reload(true)
      }
    }

    const back = () => {
      // 构建返回链接的URL参数
      const urlParams = new URLSearchParams({
        language: language.value,
        langKey: language.value,
        replace: redirect.slice(1),
        color: window.localStorage.getItem('color') || 'red',
      })

      // 更新页面URL
      window.location.href = `${getMobileIndex()}#${redirect}?${urlParams.toString()}`

      // 非手机且在iframe中时,需要滚动到指定菜单位置
      if (!isPhone() && inIframe()) {
        ;(window.top as any).scrollToMenu(redirect.slice(1))
      }
    }

    const toGithub = () => {
      if (inIframe() && !isPhone()) {
        window.top!.open(github.value)
      } else {
        window.location.href = github.value
      }
    }

    watchLang((newValue) => {
      language.value = newValue
    })

    watch(
      () => route.path,
      (to: string) => {
        const componentName = pascalCase(to.slice(1))
        const redirectName = pascalCase(redirect.slice(1))
        bigCamelizeComponentName.value = componentName === redirectName ? '' : componentName
        showBackIcon.value = componentName !== redirectName
      },
    )

    const getThemeMessage = () => ({ action: 'theme-change', from: 'mobile', data: currentTheme.value })

    const setCurrentTheme = (theme: Theme) => {
      currentTheme.value = theme
      setTheme(currentTheme.value)
      window.localStorage.setItem(config?.themeKey, currentTheme.value)
    }

    const toggleTheme = (value: Theme) => {
      currentMobileTheme.value = value
      // setCurrentTheme(value)
      // window.postMessage(getThemeMessage(), '*')
      // window.localStorage.setItem('mobileTheme', currentMobileTheme.value)
      changeTheme(value)
      showThemeMenu.value = false

      if (!isPhone() && inIframe()) {
        ;(window.top as any).postMessage(getThemeMessage(), '*')
      }
    }
    const changeTheme = (value: Theme) => {
      // 主题颜色列表
      const themeColors = ['red', 'white', 'black', 'bluew', 'blueb']

      // 获取并处理body的class
      const bodyClasses = new Set(document.body.className.split(' '))

      // 移除旧的主题相关class
      themeColors.forEach((color) => {
        bodyClasses.delete(color)
        bodyClasses.delete(`body-${color}`)
      })

      // 添加新的主题class
      if (value) {
        bodyClasses.add(value)
        bodyClasses.add(`body-${value}`)
      }

      // 更新body class
      document.body.className = Array.from(bodyClasses).join(' ').trim()

      // 保存主题设置
      window.localStorage.setItem('color', value)

      // 构建新的URL并跳转
      const params = new URLSearchParams({
        color: value,
        language: language.value,
        langKey: language.value,
        replace: route.query.replace as string,
      })

      window.location.href = `${getMobileIndex()}#${route.path}?${params.toString()}`
      // 刷新iframe
      window.parent.frames['mobile'].location.reload(true)
    }
    const toggleZbb = (value: string) => {
      // 更新当前选中的值
      currentZbb.value = value

      // 解析当前URL参数
      const url = new URL(window.location.href)
      const searchParams = new URLSearchParams(url.search)

      // 设置新的参数
      searchParams.set('SeniorEditionFlag', value)

      // 构建新的URL
      const newUrl = `${url.origin}${url.pathname}?${searchParams.toString()}`

      // 更新URL并保存到localStorage
      window.location.href = newUrl
      window.localStorage.setItem('SeniorEditionFlag', value)

      // 刷新iframe
      window.parent.frames['mobile'].location.reload(true)
    }
    const toggleLanguage = (value: string) => {
      currentMobileLanguage.value = value
      showLanguageMenu.value = false

      // if (!isPhone() && inIframe()) {
      //   ;(window.top as any).postMessage(getThemeMessage(), '*')
      // }
    }
    ;(window as any).toggleTheme = toggleTheme
    setTheme(currentTheme.value)
    window.postMessage(getThemeMessage(), '*')

    document.body.addEventListener('click', () => {
      showMenu.value = false
      showThemeMenu.value = false
      showZbbMenu.value = false
    })

    watchTheme((theme, from) => {
      from === 'pc' && setCurrentTheme(theme)
    })

    const handleThemeButtonClick = () => {
      showZbbMenu.value = false
      showThemeMenu.value = true
      showMenu.value = false
    }

    const handleZbbButtonClick = () => {
      showZbbMenu.value = true
      showThemeMenu.value = false
      showMenu.value = false
    }

    const handleLanguageButtonClick = () => {
      showZbbMenu.value = false
      showThemeMenu.value = false
      showMenu.value = true
    }

    return {
      bigCamelizeComponentName,
      showBackIcon,
      github,
      showMenu,
      languages,
      themes,
      language,
      nonEmptyLanguages,
      currentTheme,
      darkMode,
      toGithub,
      back,
      changeLanguage,
      toggleTheme,
      showThemeMenu,
      showZbbMenu,
      zbbMenu,
      currentZbb,
      toggleZbb,
      currentMobileTheme,
      toggleLanguage,
      currentMobileLanguage,
      handleThemeButtonClick,
      handleZbbButtonClick,
      handleLanguageButtonClick,
    }
  },
})
</script>

<style lang="less">
* {
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
  -webkit-tap-highlight-color: transparent;
  background: var(--site-config-color-mobile-body);
  color: var(--site-config-color-text);
  transition:
    background-color 0.25s,
    color 0.25s;
}

::-webkit-scrollbar {
  display: none;
  width: 0;
  background: transparent;
}

.app-type {
  width: 100%;
  padding: 15px;
  color: var(--site-config-color-sub-text);
  font-size: 14px;
}

header {
  position: fixed;
  z-index: 99;
  width: 100%;
  font-weight: bold;
}

.site {
  &-menu-enter-from,
  &-menu-leave-to {
    transform: translateY(-10px);
    opacity: 0;
  }

  &-menu-enter-active,
  &-menu-leave-active {
    transition-property: opacity, transform;
    transition-duration: 0.25s;
  }
}

.settings {
  position: fixed;
  z-index: 200;
  top: 48px;
  right: 5px;
  background: var(--site-config-color-bar);
}

.theme-settings {
  position: fixed;
  z-index: 200;
  top: 48px;
  right: 75px;
  background: var(--site-config-color-bar);
}

.zbbmenu-settings {
  position: fixed;
  z-index: 200;
  top: 48px;
  right: 130px;
  background: var(--site-config-color-bar);
}

.router-view__block {
  padding-top: 55px;
  padding-bottom: 15px;
  // padding: 55px 15px 15px;
}

.mobile-language-cell {
  color: var(--site-config-color-text) !important;
  background: var(--site-config-color-bar) !important;
  cursor: pointer !important;

  &--active {
    color: var(--site-config-color-mobile-language-active) !important;
    background: var(--site-config-color-mobile-language-active-background) !important;
  }
}

.mobile-theme-cell {
  color: var(--site-config-color-text) !important;
  background: var(--site-config-color-bar) !important;
  cursor: pointer !important;

  &--active {
    color: var(--site-config-color-mobile-theme-active) !important;
    background: var(--site-config-color-mobile-theme-active-background) !important;
  }
}

.arrow-left {
  font-size: 28px !important;
}

.github {
  font-size: 28px !important;
}

.i18n {
  font-size: 24px !important;
}

.palette {
  font-size: 24px !important;
}

.arrow-down {
  font-size: 22px !important;
}

.i18n-button {
  padding-right: 6px !important;
  margin-right: 4px;
  padding-left: 12px !important;
}

.theme-button {
  padding-right: 6px !important;
  margin-right: 4px;
  padding-left: 12px !important;
}

.app-bar {
  background: var(--site-config-color-app-bar) !important;
}

.body-red,
.body-bluew {
  background: #ffffff !important;
}

.body-black,
.body-blueb {
  background: #121212 !important;
}
</style>

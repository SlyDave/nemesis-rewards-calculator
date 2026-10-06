import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

import withNuxt from './.nuxt/eslint.config.mjs'

/*
 * As strict as the tools go.
 *
 * The Nuxt module already turns on typescript-eslint's `strict-type-checked` set, the
 * type-aware one (nuxt.config.ts gives it the tsconfig), and Vue's `recommended` set, its
 * highest. This adds typescript-eslint's `stylistic-type-checked`, then the rules that no
 * preset includes because they are opinions — all of them the strict opinion.
 */

/** The rules of a typescript-eslint preset, without the parser and plugin setup around them. */
const rulesOf = (configs) => Object.assign({}, ...configs.map((config) => config.rules ?? {}))

export default withNuxt(
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      ...rulesOf(tseslint.configs.stylisticTypeChecked),

      // --- TypeScript --------------------------------------------------------------------
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/explicit-member-accessibility': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-loop-func': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
      '@typescript-eslint/no-unsafe-type-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        { allowString: false, allowNumber: false, allowNullableObject: false },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { requireDefaultForNonUnion: true },
      ],

      // --- JavaScript --------------------------------------------------------------------
      'array-callback-return': ['error', { checkForEach: true }],
      curly: ['error', 'all'],
      'default-case-last': 'error',
      eqeqeq: ['error', 'always'],
      'no-alert': 'error',
      'no-console': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-implicit-coercion': 'error',
      'no-lonely-if': 'error',
      'no-nested-ternary': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-return-assign': ['error', 'always'],
      'no-unneeded-ternary': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'prefer-object-spread': 'error',
      'prefer-template': 'error',
      radix: 'error',
      yoda: 'error',

      // --- Imports -----------------------------------------------------------------------
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-self-import': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/define-macros-order': 'error',
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/eqeqeq': ['error', 'always'],
      'vue/html-button-has-type': 'error',
      'vue/no-boolean-default': 'error',
      'vue/no-duplicate-attr-inheritance': 'error',
      'vue/no-empty-component-block': 'error',
      'vue/no-ref-object-reactivity-loss': 'error',
      'vue/no-required-prop-with-default': 'error',
      'vue/no-static-inline-styles': 'error',
      'vue/no-template-target-blank': 'error',
      'vue/no-unused-emit-declarations': 'error',
      'vue/no-unused-properties': 'error',
      'vue/no-unused-refs': 'error',
      'vue/no-use-v-else-with-v-for': 'error',
      'vue/no-useless-mustaches': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/no-v-html': 'error',
      'vue/no-v-text': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/prefer-define-options': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/require-explicit-slots': 'error',
      'vue/require-macro-variable-name': 'error',
      'vue/require-typed-ref': 'error',
      'vue/v-for-delimiter-style': ['error', 'in'],
      // Pages are named for their route, which is one word more often than not.
      'vue/multi-word-component-names': ['error', { ignores: ['index'] }],
    },
  },
  {
    // The build scripts report what they did on the console; that is what it is for.
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
  {
    ignores: ['.nuxt/**', '.output/**', 'dist/**', 'scripts/capture-gamefound.js'],
  },
)

module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es6: true,
	},
	extends: [
		'airbnb-base',
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
		require: 'readonly'
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	rules: {
		indent: [2, 4],
		"no-tabs": 0,
		"func-names": 0,
		'global-require': 0,
		"no-console": 0,
		"prefer-arrow-callback": 0,
		"no-underscore-dangle": 0,
		"import/no-dynamic-require": 0
	}
};

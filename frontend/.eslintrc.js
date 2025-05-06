export default {
    "env": {
      "browser": true,
      "es2021": true,
      "node": true
    },
    "extends": [
      "eslint:recommended",
      // Add these lines for TypeScript
      "plugin:@typescript-eslint/recommended",
      // Add this line for React
      "plugin:react/recommended"
    ],
    "parser": "@typescript-eslint/parser", // Add this line for TypeScript
    "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module",
      "ecmaFeatures": {
        "jsx": true
      }
    },
    "plugins": [
      "unused-imports",
      "@typescript-eslint",  // Add this line for TypeScript
      "react"  // Add this line for React
    ],
    "rules": {
      // Detect and remove unused imports
      "unused-imports/no-unused-imports": "error",

      // Detect and highlight unused variables
      "no-unused-vars": ["warn", {
        "vars": "all",
        "varsIgnorePattern": "^_",
        "args": "after-used",
        "argsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }]
    }
  };

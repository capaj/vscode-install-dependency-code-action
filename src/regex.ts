export const importStatementRegex =
  /^\s*import\s+(?:[^'"]+\s+from\s+)?['"]((?![./])[^'"]+)['"]/

// const code = `
//   import React from 'react';
//   import { useState } from 'react';
//   import './local-file';
//   import '@babel/core';
//   import 'module-name';
// `

// const codes = code.split('\n')

// codes.forEach((code) => {
//   const match = importStatementRegex.exec(code)
//   console.log(match?.[1])
// })

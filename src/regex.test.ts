import { expect } from 'chai'
import 'mocha'
import { importStatementRegex } from './regex'

describe('importStatementRegex', () => {
  it('should match named imports from modules', () => {
    const code = `import { useState } from 'react';`
    const match = importStatementRegex.exec(code)
    expect(match).to.not.be.null
    expect(match![1]).to.equal('react')
  })

  it('should match default imports from modules', () => {
    const code = `import React from 'react';`
    const match = importStatementRegex.exec(code)
    expect(match).to.not.be.null
    expect(match![1]).to.equal('react')
  })

  it('should not match local file imports', () => {
    const code = `import './local-file';`
    const match = importStatementRegex.exec(code)
    expect(match).to.be.null
  })

  it('should match scoped package imports', () => {
    const code = `import '@babel/core';`
    const match = importStatementRegex.exec(code)
    expect(match).to.not.be.null
    expect(match![1]).to.equal('@babel/core')
  })

  it('should match unscoped package imports', () => {
    const code = `import 'module-name';`
    const match = importStatementRegex.exec(code)
    expect(match).to.not.be.null
    expect(match![1]).to.equal('module-name')
  })
})

// We recommend installing an extension to run mocha tests.

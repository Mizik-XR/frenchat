module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      paths: [{
        name: 'react',
        importNames: ['default', 'useState', 'useEffect', 'useContext', 'createContext', 'useCallback', 'useMemo', 'useRef', 'useLayoutEffect'],
        message: 'Please import React and hooks from @/core/ReactInstance instead.'
      }]
    }]
  }
}; 
#!/bin/zsh
cd "${0:A:h}"
if [[ ! -d node_modules ]]; then
  npm install || exit $?
fi
print 'Open http://localhost:3000 once Vite reports that it is ready.'
npm run dev

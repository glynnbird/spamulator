# spamulator

A changes feed simulator.

## Installation

    git clone https://github.com/glynnbird/spamulator
    cd spamulator
    npm install

## Running

    npm start
    
## Using

For a clean everlasting changes feed:

    curl 'http://localhost:3000/db1/_changes?feed=continuous'

For a changes feed that hangs after 15 results:

    curl 'http://localhost:3000/db2/_changes?feed=continuous'

For a partial changes feed

    curl 'http://localhost:3000/db3/_changes?feed=continuous'

## Notes

- only supports `feed=continuous`
- you may supply `include_docs=true`
- naive support for `since=0`, `since=now`, `since=15-abc1234`

Every third change is a insert, update or a delete in rotation.
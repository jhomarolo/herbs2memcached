const { entity, field } = require('@herbsjs/gotu')
const Repository = require('../src/repository')
const connection = require('./connection')
const assert = require('assert')
let client = {}

describe('Query Get', () => {

    const keyPrefix = 'test_repository_'
  
      before(async () => {
  
        client = await connection()
  
        await client.flush
        await client.set(`${keyPrefix}${'60edc25fc39277307ca9a7ff'}`, { id: "60edc25fc39277307ca9a7ff", number_test: 100, boolean_test: true, string_test: 'aString' }, 120, function (err) { /* stuff */ })
        await client.set(`${keyPrefix}${'70edc25fc39277307ca9a700'}`, { id: "70edc25fc39277307ca9a700", number_test: 200, boolean_test: false, string_test: 'aString' }, 120, function (err) { /* stuff */ })
        await client.set(`${keyPrefix}${'80edd25fc39272307ca9a712'}`, { id: "80edd25fc39272307ca9a712", number_test: 300, boolean_test: false, string_test: 'aString' }, 120, function (err) { /* stuff */ })
      })
  
      after(async () => {
        await client.flush
      })
  
      const givenAnRepositoryClass = (options) => {
          return class ItemRepositoryBase extends Repository {
              constructor() {
                  super(options)
              }
          }
      }
  
      const givenAnEntity = () => {
          return entity('A entity', {
            id: field(String),
            numberTest: field(Number),
            stringTest: field(String),
            booleanTest: field(Boolean)
          })
      }
  
      it('should return entities', async () => {
          //given
          const anEntity = givenAnEntity()
          const ItemRepository = givenAnRepositoryClass({
            entity: anEntity,
            keyPrefix,
            ids: ['id'],
            memcached: client
          })
  
          const injection = {}
          const itemRepo = new ItemRepository(injection)
  
          //when
          const ret = await itemRepo.get('60edc25fc39277307ca9a7ff')
  
          //then
          assert.deepStrictEqual(ret[0].toJSON(), { id: '60edc25fc39277307ca9a7ff', stringTest: "aString",  numberTest: 100, booleanTest: true })
          assert.deepStrictEqual(ret[0].isValid(),true )
      })
  })
  
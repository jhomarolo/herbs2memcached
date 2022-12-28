const { entity, field } = require('@herbsjs/gotu')
const Repository = require('../src/repository')
const connection = require('./connection')
const assert = require('assert')
let client = {}

describe('Persist Entity', () => {

    const keyPrefix = 'test_repository_'

    before(async () => {
        client = await connection()
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

    describe('Simple entity', () => {

        const givenAnEntity = () => {
            return entity('A entity', {
                id: field(String),
                code: field(Number),
                stringTest: field(String),
                booleanTest: field(Boolean)
            })
        }

        const givenAnModifiedEntity = () => {
            const anEntity = givenAnEntity()
            const anEntityInstance = new anEntity()
            anEntityInstance.stringTest = "test"
            anEntityInstance.code = 10
            anEntityInstance.booleanTest = true
            return anEntityInstance
        }

        it('should set a new item', async () => {

            //given
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass({
                entity: anEntity,
                keyPrefix,
                ids: ['id'],
                memcached: client
            })
            const aModifiedInstance = givenAnModifiedEntity()
            const key = "givenAnModifiedEntity"

            const injection = {}
            const itemRepo = new ItemRepository(injection)

            //when
            await itemRepo.set(key, aModifiedInstance)

            //then
            var findStatement = keyPrefix + key
            client.get(findStatement, function (err, data) {
                assert.deepStrictEqual(data.string_test, "test")
            })
        })
    })
})

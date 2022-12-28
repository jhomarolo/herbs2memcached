const { entity, field } = require('@herbsjs/gotu')
const Repository = require('../../src/repository')
const assert = require('assert')

describe('Query Find', () => {

    context('Find all data', () => {

        const givenAnEntity = () => {
            const ParentEntity = entity('A Parent Entity', {})

            return entity('A entity', {
                id: field(String),
                numberTest: field(Number),
                stringTest: field(String),
                booleanTest: field(Boolean),
                entityTest: field(ParentEntity),
                entitiesTest: field([ParentEntity]),
            })
        }

        const givenAnRepositoryClass = (options) => {
            return class ItemRepositoryBase extends Repository {
                constructor(options) {
                    super(options)
                }
            }
        }

        const memcached = (ret, spy = {}) => async () =>
        ({
          promiser: (f) => {
            spy.keyPrefix = f
            return {
              getPromise: (p,o) => {
                spy.payload = p
                return ret
              }
            }
          }
        })

        const promiser = (spy = {}) => async () => 
        ({
            getPromise: (i,kp, k) => {
            spy.keyPrefix = kp
            return { id: "60edc25fc39277307ca9a7ff", number_test: 100, boolean_test: true, string_test: 'aString' }
          }
        })
      

        it('should return entities using table field', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: "60edc25fc39277307ca9a7ff", number_test: 100, boolean_test: true, string_test: 'aString' },
                { id: "70edc25fc39277307ca9a700", number_test: 200, boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                collection: 'aCollection',
                ids: ['id'],
                memcached: memcached(retFromDeb, spy),
                injection: { promiser }
            })

            //when
            const ret = await itemRepo.get("60edc25fc39277307ca9a7ff")

            //then
            assert.strictEqual(ret.length, 1)
        })
    })

})

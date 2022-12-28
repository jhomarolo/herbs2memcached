const { entity, field } = require("@herbsjs/gotu")
const Repository = require("../../src/repository")
const assert = require("assert")



describe("Set an Entity", () => {
  const givenAnEntity = () => {
    const ParentEntity = entity('A Parent Entity', {})

    return entity('A entity', {
      id: field(String),
      numberTest: field(Number),
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
      instance: (f) => {
        spy.keyPrefix = f
        return {
          set: (p) => {
            spy.payload = p
            return ret
          }
        }
      }
    })


  it("should set an entity", async () => {
    //given
    let spy = {}
    const retFromDeb = { 
      insertedId: "60edc25fc39277307ca9a7ff",
      acknowledged : true
    }
    const keyPrefix = "aCollection"
    const anEntity = givenAnEntity()
    const ItemRepository = givenAnRepositoryClass()
    const itemRepo = new ItemRepository({
      entity: anEntity,
      keyPrefix,
      ids: ["id"],
      memcached: memcached(retFromDeb, spy)
    })

    anEntity.id = "60edc25fc39277307ca9a7ff"
    anEntity.numberTest = 100
    anEntity.booleanTest = true
    const key = "givenAnModifiedEntity"


    //when
    const ret = await itemRepo.set(key, anEntity)

    //then
    assert.deepStrictEqual(ret.id,  "60edc25fc39277307ca9a7ff")
    assert.deepStrictEqual(spy.keyPrefix, keyPrefix)
    assert.deepStrictEqual(spy.payload, { id: "60edc25fc39277307ca9a7ff", number_test: 100, boolean_test: true })
  })
})

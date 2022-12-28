[![CI](https://github.com/herbsjs/herbs2memcached/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/herbsjs/herbs2memcached/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/herbsjs/herbs2memcached/branch/main/graph/badge.svg)](https://codecov.io/gh/herbsjs/herbs2memcached)

# herbs2memcached

herbs2memcached creates repositories to retrieve and store [Entities](https://github.com/herbsjs/gotu) using [memcached](https://github.com/3rd-Eden/memcached).

### Installing
```
    $ npm install @herbsjs/herbs2memcached
```

### Using

`connection.js` - memcached initialization:
```javascript
const Memcached = require('memcached')
const config = require('./config')

let dbInstance = null

module.exports = async () => {
  Object.assign(this, config)
  if (!this.enabled) return

  if (dbInstance) {
    return new Promise((resolve) => resolve(dbInstance))
  }
  dbInstance = new Memcached(this.server, this.options)
  dbInstance.lifetime = this.lifetime
  return dbInstance

}


```

`itemRepository.js`:
```javascript
const { Repository } = require('@herbsjs/herbs2memcached')
const connection = require('connection')
const { Item } = require('../domain/entities/item')
const database = 'myKeyPrefix_'

class ItemRepository extends Repository {
    constructor() {
        super({
            entity: Item,
            keyPrefix,
            ids: ['id'],
            memcached: connection
        })
    }      

    excludedItemFromLastWeek() {
        ...
    }
}
```

`someUsecase.js`:
```javascript
const repo = new ItemRepository()
const ret = await repo.get('60edc25fc39277307ca9a7ff') // note that the id is equivalent to ObjectId _id field
```

### What is a Repository?

A repository, by [definition](https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks), is part of the layer to retrieve and store entities abstracting the underlying implementation. By using repositories, details of these implementation such as relational database, document-oriented databases, etc, should not leak to the domain code. In other words, no raw SQL queries on your use case or entity files.

### herbs2memcached Repository

In order to boost productivity herbs2memcached provides way to dynamically generate a repository class based on your Entities and other metadata.

These metadata are necessary to close the gap between OOP concepts and paradigms and those of relational databases. For example, it is necessary to specify primary keys and foreign keys as these information do not exist in the description of your domain.

Following Herbs architecture principals it is not the intention of this lib to create yet another ODM or query builder but to create a bridge between your domain and an existing one (from memcached).


### Repository setup

```javascript
const { Repository } = require('@herbsjs/herbs2memcached')
const connection = require('connection')  // memcached initialize instance
const { ProductItem } = require('../domain/entities/productItem')

class YourRepository extends Repository {
    constructor() {
        super({
            entity: ProductItem,
            keyPrefix: 'product_items_',
            ids: ['id'],
            memcached: connection
        })
    }
}
```

- `entity` - The [Entity](https://github.com/herbsjs/gotu) to be used as reference

    ```javascript
    entity: ProductItem
    ```

- `keyPrefix` - The name of the prefix of the key (optional)

    ```javascript
    keyPrefix: 'product_items_'
    ```

- `ids` - Primary keys

    Format: `['fieldName', 'fieldName', ...]`

    There must be corresponding fields in the entity.

    ```javascript
    ids: ['id']  // productItem.id
    ```

    or for composite primary key:

    ```javascript
    ids: [`customerId`, `productId`]  // productItem.customerId , productItem.productId
    ```

- `memcached` - memcached driver initialize instance

    Check memcached [documentation](https://github.com/3rd-Eden/memcached)



## Retrieving and Persisting Data

### `get`
get entities

Format: `.get(key)` where `key` is the key of the stored value

Return: Entity array

```javascript
const repo = new ItemRepository(injection)
const key = "myKey"
const ret = await repo.get(key)
```


### `set`

Insert an Entity into the database.

Format: `.set(key, entity)` where `entity` is a Entity instance with values to be persisted and key is the key of the value

Return: The inserted entity with the values from database.

```javascript
const repo = new ItemRepository(injection)
const key = "myKey"
const ret = await repo.insert(key, aNewEntity)
```


## TODO

- [ ] Allow only scalar types for queries (don't allow entity / object types)
- [ ] Allow to ommit database name

Features:
- [ ] Be able to change the conventions (injection)
- [ ] Exclude / ignore fields on all query statement
- [ ] Awareness of created/updated at/by fields
- [X] Plug-and-play memcached

Retrieving and Persist:
- [X] set
    - [ ] batchs (setMany)
- [X] update
    - [ ] batchs (updateMany)
- [X] delete (id)
    - [ ] batchs (deleteMany)
- [ ] persist (upsert)
- [X] get
    - [ ] batchs (getMany)
    - [ ] deal with entities / tables with custom _ids
- [X] find by (any field)
    - [ ] deal with entities / tables with custom _ids
    - [X] order by
    - [X] limit
    - [X] skip
- [ ] get All by prefix
- [ ] find with pages
- [ ] first
- [ ] last

Tests:
- [ ] Pure JS
- [X] memcached

### Contribute
Come with us to make an awesome *herbs2memcached*.

Now, if you do not have the technical knowledge and also have intended to help us, do not feel shy, [click here](https://github.com/herbsjs/herbs2memcached/issues) to open an issue and collaborate their ideas, the contribution may be a criticism or a compliment (why not?)

If you would like to help contribute to this repository, please see [CONTRIBUTING](https://github.com/herbsjs/herbs2memcached/blob/main/.github/CONTRIBUTING.md)

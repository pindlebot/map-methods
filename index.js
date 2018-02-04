const toPath = require('lodash.topath')

class Collection extends Map {
  getIn (path) {
    return toPath(path).reduce((acc, val) =>
      acc.has(val) ? acc.get(val) : acc,
    this)
  }

  setIn (path, value) {
    path = toPath(path)
    const key = path.pop()
    const child = this.getIn(path)
    if (child instanceof Collection) {
      child.set(key, value)
    }
    return this
  }

  toJSON () {
    return [...this.entries()]
      .filter(([k, v]) => v !== '' && typeof v !== 'undefined')
      .reduce((acc, [k, v]) => {
        if (v instanceof Collection) {
          acc[k] = v.toJSON()
        } else if (v instanceof Set) {
          acc[k] = [...v]
        } else {
          acc[k] = v
        }
        return acc
      }, {})
  }

  fromJSON (props) {
    return new Collection([
      ...Object.entries(props).map(([k, v]) => {
        if (v instanceof Collection) {
          return [k, v.fromJSON()]
        }
        if (Array.isArray(v)) {
          return [k, new Set(v)]
        }
        if (typeof v === 'object' && v.constructor === Object) {
          return [k, new Collection().fromJSON(v)]
        }
        return [k, v]
      })
    ])
  }

  merge (props) {
    let entries
    if (
      typeof props === 'object' &&
      props.constructor === Object
    ) {
      entries = Object.entries(props)
    } else if (props instanceof Map) {
      entries = props
    } else {
      return this
    }

    for (let [k, v] of entries) {
      this.set(k, v)
    }
    return this
  }

  first () {
    for (let v of this) {
      return v
    }
  }
}

module.exports = Collection
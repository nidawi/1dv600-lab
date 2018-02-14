/**
 * The Vault module.
 *
 * @author nidawi
 * @version 0.2.0
 */

// Experimental class for safe storage. Essentially a mix between Object.seal and Object.freeze. It's not... great.
// I know that this still isn't perfectly safe, especially not when dealing with objects like HTMLElements etc.
// There's essentially no real way to protect things, but this is at least something. You can still enter incorrect values and references even
// if they're of the correct type. You can also still fetch an HTMLElement and completely ruin it. So all in all, this really doesn't do anything
// other than assure me that a number will at least be a number and not a string or whatever. Reduces the amount of IFs I have to make.
// I intend to extend upon this module for Examination 3, as I quite like it. Mostly just a placebo but oh well. It's fun!
// Also, I am not claiming this is anything cool, but I am somewhat happy about figuring all this proto/type/callback stuff out myself.

class Vault {
  /**
   * Creates a new Vault instance with the properties provided by the provided object.
   * The Vault offers a basic level of "security" for values, similarly to Object.seal or Object.freeze.
   * Difference being that the Vault allows for more easily configurable data values, as well as adding new values after creation (albeit limited).
   * @version 0.2.0 Testing 2
   * @author nidawi
   * @copyright nidawi
   * @since 12/5/17
   * @class
   * @design The Vault is NOT designed to accept new properties, but rather modify existing ones.
   * @design The vault itself is frozen by default, to protect itself.
   * @attributes Value ATTRBUTES can ONLY be defined at object creation. They are OFF-LIMITS after that.
   * @attributes If the provided attributes aren't in the correct format or type, they will be ignored. Also, they aren't necessarily
   * compatible with one another. If writable is false, none of the other value-assigning attributes will be considered, as an example.
   * Additionally, acceptedTypes supercedes configurable. acceptedTypes also accepts base classes that it will attempt to verify
   * by using instanceof on them.
   * @adding New items can be added (using method addItem), but any values added AFTER creation has to be retrieved using the method get().
   * @deletion Items CANNOT be "completely deleted". Even if a value is deleted from the Vault, it will still show up but will always return undefined.
   * @todo Finish implementation of remaining attributes.
   * @todo Public functions should be remade into properties with enumerable set to "false" so that they do not show up when you print the object.
   * @param {Object} obj The object with properties to add to the Vault.
   * @param {Object} [attr] The attributes to assign the values stored in this Vault. These cannot be modified after creation.
   * @param {Object} attr.key The key to the item to apply these attributes.
   * @param {boolean} attr.key.writable Whether the item can have its value changed (of the same type) IMPLEMENTED
   * @param {boolean} attr.key.configurable Whether the item can be reassigned (different type) IMPLEMENTED
   * @param {boolean} attr.key.enumerable Whether this item shows up in getKeys() and hasKey() IMPLEMENTED
   * @param {boolean} attr.key.deletable Whether this item can be deleted. NOT_IMPLEMENTED
   * @param {boolean} attr.key.acceptsNaN Whether this item [if number] accepts NaN. IMPLEMENTED
   * @param {string[]} attr.key.acceptedTypes Which value types this item can be assigned. IMPLEMENTED
   * @param {function('old value','new value')=>boolean} attr.key.editVer A callback to run on a new value (oldValue, newValue). If it returns true, allow the change. IMPLEMENTED
   * @param {Object} [vSettings] Optional Vault settings.
   * @param {boolean} vSettings.vocal Whether the vault should print status messages to the console.
   * @param {boolean} vSettings.throws Whether the Vault should throw errors when invalid values are put in.
   */
  constructor (obj, attr = null, vSettings = null) {
    let data = { }
    let attributes = (attr !== null && typeof attr === 'object' && Object.getPrototypeOf(attr) === Object.getPrototypeOf({})) ? attr : null
    let defaults = {
      writable: true,
      configurable: false,
      enumerable: true,
      deletable: false,
      acceptsNaN: false,
      acceptedTypes: [],
      alias: [],
      editVer: function (a, b) { return true } // I couldn't get @callback definitions to work for some reason. Many sads.
    }
    let settings = {
      vocal: (vSettings && vSettings.vocal === true) ? vSettings.vocal : false,
      throws: (vSettings && vSettings.throws === true) ? vSettings.throws : false
    }

    /**
     * Gets the attributes linked to the specific key. Returns null if there are no attributes.
     * @param {string} key The key to look for.
     * @private
     * @returns {Object|null} The attributes linked to the key.
     */
    const getAttributes = function (key) {
      if (attributes === null) return null
      else {
        return (attributes[key] !== undefined && Object.getPrototypeOf(attributes[key]) === Object.getPrototypeOf({})) ? attributes[key] : null
      }
    }
    /**
     * Fetches a specific attribute for an item's attribute list, returning a default value if no attribute was found.
     * @param {string} key The key to look for.
     * @param {string} attr The attribute to fetch.
     * @returns {Object|null} The attributes linked to the key.
     */
    const getAttribute = function (key, attr) {
      let attris = getAttributes(key)
      if (attris !== null) {
        if (attris[attr] !== undefined && typeof attris[attr] === typeof defaults[attr] && Array.isArray(attris[attr]) === Array.isArray(defaults[attr])) return attris[attr]
      }

      return defaults[attr]
    }
    /**
     * Gets the key owning the provided alias.
     * @param {string} alias The alias.
     * @returns {string}
     */
    const getAliasOwner = alias => {
      let result
      Object.keys(attributes).forEach(a => {
        let aliases = attributes[a].alias
        if (aliases && aliases.indexOf(alias) > -1) result = a
      })
      return result
    }
    /**
     * Fetches a type in a more strict way than the typeof operator.
     * @param {*} obj Any object to check.
     * @returns {string} The type of the object.
     */
    const getType = function (obj) {
      let _t = typeof obj
      if (_t === 'object') {
        return Object.prototype.toString.call(obj).toLowerCase().replace(/(\]|\[|object )/g, '')
      } else return _t
    }
    /**
     * Handles rejection based on settings.
     * @param {string} text Text to display.
     * @param {string} [override] Override text to send as error.
     */
    const handleRejection = function (text, override = null) {
      if (text) {
        if (settings.vocal) console.error(text)
        if (settings.throws) throw new Error(override || text)
      }
    }
    /**
     * Checks if newValue is a valid replacement for the value contained at the provided key.
     * @param {string} key The key.
     * @param {*} newValue The new value.
     * @todo Add support for remaining attributes: deletable
     * @todo Add support for checking values in arrays.
     * @throws {Error} The newValue is not valid.
     * @returns {boolean} The newValue is valid. (only returns true, otherwise error).
     */
    const isValid = function (key, newValue) {
      let old = { value: data[key], type: getType(data[key]) }
      if (old.value === undefined) throw new Error('INVALID_ITEM')
      let rep = { value: newValue, type: getType(newValue) }
      // The item is not writable at all.
      if (!getAttribute(key, 'writable')) throw new Error('READONLY')

      // Special checks that take priority over other checks.
      if (rep.type === 'number' && isNaN(rep.value) && !getAttribute(key, 'acceptsNaN')) throw new Error('ILLEGAL_VALUE')

      // Check if types are the same. If they're not, a whole lot of other things need to be checked.
      if (old.type !== rep.type) {
        if (!getAttribute(key, 'acceptedTypes').some((a) => { try { return rep.type === getType(a) || rep.value instanceof a } catch (e) { return false } }) && !getAttribute(key, 'configurable')) {
          // The value is NOT configurable (new type assignment) AND the new value is NOT on the list of accepted types.
          throw new Error('INVALID_TYPE')
        }
      } else {
        if (old.type === 'object') {
          // Custom object. Need to check for prototypes.
          // The prototypes don't match.
          if (Object.getPrototypeOf(old.value) !== Object.getPrototypeOf(rep.value)) throw new Error('OBJECT_MISMATCH')
        }
      }

      // Even if we get this far, the value has to pass the user-defined verification callback function.
      // This won't work if the provided callback is faulty. Need to fix that sometime.
      let fn = (getAttribute(key, 'editVer'))
      if (!fn(old.value, rep.value)) throw new Error('VERIFICATION_FAILED')

      // If we get this far, the new value passed all checks.
      return true
    }
    /**
     * Returns a value with the specified key or alias.
     * @param {string} key The key/alias of the item to get.
     * @returns {*} The retrieved value.
     */
    this.get = function (id) {
      id = getAliasOwner(id) || id
      if (Object.keys(data).indexOf(id) > -1) return data[id]
      // It does not exist.
      return undefined
    }
    /**
     * Returns a string array containing all keys contained in this instance of Vault.
     * @returns {string[]} The list of keys.
     */
    this.getKeys = function () {
      return Object.keys(data).filter((a) => {
        return getAttribute(a, 'enumerable')
      })
    }
    /**
     * Returns a boolean representing whether the specified key is contained within this instance of Vault.
     * @param {string} key The key to look for.
     * @returns {boolean} Whether the key exists.
     */
    this.hasKey = function (key) {
      if (typeof key !== 'string') return false
      return (data.hasOwnProperty(key) && getAttribute(key, 'enumerable'))
    }
    /**
     * Returns a copy of this object's public data.
     * This only includes data values, no methods, etc. This object is not linked to the one stored in the vault, so any changes won't affect the vault.
     * Additionally, data with enumerable set to false won't be included.
     * @returns {*} the data.
     */
    this.getCopy = () => {
      let newObj = {}
      this.getKeys().forEach(a => { newObj[a] = data[a] })
      return JSON.parse(JSON.stringify(newObj))
    }
    /**
     * Adds an item to the Vault. Returns true if successful, otherwise false.
     * @param {string} key The key of the value.
     * @param {*} value The value to assign to the key.
     * @returns {boolean} Success/fail.
     */
    this.addItem = function (key, value) {
      if (typeof key !== 'string' || [...Object.keys(data), ...Object.keys(this)].indexOf(key) > -1) {
        handleRejection(`[VAULT] ADD "${key}": ${value} [${typeof value}]: REJECTED`)
        return false
      }

      data[key] = value

      // Define it as a property. This "conceals" the vault as a normal object.
      // This only works on creation, or if the object isn't frozen.
      if (!Object.isFrozen(this)) {
        Object.defineProperty(this, key, {
          enumerable: true, // We need to set this to true for the value to show up on the object like it would normally.
          get: function () { return this.get(key) },
          set: function (newValue) { this.setItem(key, newValue) }
        })
      }
      return true
    }
    /**
     * Changes the value of an item within the Vault. Returns true if successful, otherwise false.
     * @param {string} key The key/alias of the item.
     * @param {*} newValue The new value.
     * @returns {boolean} Success/fail.
     */
    this.setItem = function (key, newValue) {
      // To handle alias, we need to fetch the key first.
      key = getAliasOwner(key) || key
      let oldValue = data[key]

      try {
        if (isValid(key, newValue)) {
          if (settings.vocal) console.log(`[VAULT] SET "${key}": ${oldValue} [${getType(oldValue)}] => ${newValue} [${getType(newValue)}]: ACCEPTED`)
          data[key] = newValue
          return true
        }
      } catch (error) {
        handleRejection(`[VAULT] SET "${key}": ${oldValue} [${getType(oldValue)}] => ${newValue} [${getType(newValue)}]: REJECTED (${error.message})`)
        return false
      }
    }

    // Fill the object with the passed argument obj
    if (typeof obj === 'object') {
      Object.keys(obj).forEach((a) => {
        this.addItem(a, obj[a])
      })
    }

    // Here, it would be neat to add something like return Object.seal(this) but sadly that makes our own defineProperty break.
    // Doesn't seem to be a way for us to prevent users from adding values or functions to this object that could
    // in turn be malicious without also preventing ourselves from defining properties.
    // Javascript has made me paranoid. We'll use freeze for now to prevent messing around too much. Will look into this more in the future.
    return Object.freeze(this)
  }
}

module.exports = Vault

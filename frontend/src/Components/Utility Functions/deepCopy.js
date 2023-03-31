export const deepCopy = (inputObject) => {
    let copiedEntries, value, key

  if (typeof inputObject !== "object" || inputObject === null) {
    return inputObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  copiedEntries = Array.isArray(inputObject) ? [] : {}

  for (key in inputObject) {
    value = inputObject[key]

    // Recursively (deep) copy for nested objects, including arrays
    copiedEntries[key] = deepCopy(value)
  }

  return copiedEntries
}